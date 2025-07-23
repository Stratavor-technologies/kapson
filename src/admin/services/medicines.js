const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const { query } = require("express");
const mongoose = require("mongoose");

const populate = [
    { path: "category" },
    { path: "company" },
    { path: "rating",
        populate: {
            path: "userId" 
          }
    },
    { path: "subCategory"}
];

const getById = async (id) => {
    return await db.medicine.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    
    return await db.medicine.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.medicineName) {
        entity.medicineName = model.medicineName;
    }
    if (model.subCategory) { 
        entity.subCategory = model.subCategory;
    }
    if (model.category) {
        entity.category = model.category;
    }
    if (model.manufacturerData) {
        entity.manufacturerData = model.manufacturerData;
    }
    if (model.price) {
        entity.price = model.price;
    }
    if (model.status) {
        entity.status = model.status;
    }
    if (model.stock || model.stock === 0) {
        entity.stock = model.stock;
    }
    if (model.expireDate) {
        entity.expireDate = model.expireDate;
    }
    if (model.image) {
        entity.image = model.image;
    }
    if (model.medicineDetails) {
        entity.medicineDetails = model.medicineDetails;
    }
    if (model.status) {
        entity.status = model.status;
    }
    if (model.company) {
        entity.company = model.company;
    }
    return entity;
};

exports.create = async (body, user) => {
    const existingMedicine = await db.medicine.findOne({ medicineName: body.medicineName });
    if (existingMedicine) {
         //throw { message: constants.MEDICINE_ALREADY_EXISTS };
        return existingMedicine;
    }
    body.createdBy = user.id
    const data = await db.medicine.newEntity(body);
    const entity = await db.medicine.create(data);
    return entity;
};

exports.update = async (id, model) => {

    let entity = await db.medicine.findById(id);
    if (!entity) {
        throw { message: constants.MEDICINE_NOT_FOUND };
    }

    entity = set(model, entity);
    return await entity.save();
};

exports.get = async (query) => {
    if (typeof query === "string" && query.isObjectId()) {
        return getById(query);
    }

    if (query.id) {
        return getById(query.id);
    }
    if (query.name) {
        return getByCondition({ name: query.name });
    }

    return null;
};

exports.search = async (query, page) => {
    //let match = {};
    let match = {
        stock: { $gt: 0 } // Only include medicines that are in stock
    };

    if (query.medicineId) {
        match["_id"] = new mongoose.Types.ObjectId(query.medicineId);
    }
    
    if (query.categoryId) {
        match["category"] = new mongoose.Types.ObjectId(query.categoryId);
    }
    
    if (query.subCategoryId) {
        match["subCategory"] = new mongoose.Types.ObjectId(query.subCategoryId);
    }
    
    if (query.companyId) {
        if (mongoose.Types.ObjectId.isValid(query.companyId)) {
            match["company"] = new mongoose.Types.ObjectId(query.companyId);
        }
    }
    
    if (query.search) {
        match["$or"] = [
            { medicineName: new RegExp(query.search, "i") },
            { medicineDetails: new RegExp(query.search, "i") },
        ];
    }
    
    if (query.priceRangeId && priceRanges[query.priceRangeId]) {
        match["price"] = priceRanges[query.priceRangeId];
    }
    
    if (query.priceFrom && query.priceTo) {
        match["price"] = { $gte: query.priceFrom, $lte: query.priceTo };
    } else if (query.priceFrom) {
        match["price"] = { $gte: query.priceFrom };
    } else if (query.priceTo) {
        match["price"] = { $lte: query.priceTo };
    }
    // Pagination settings
    const skip = page ? page.skip : 0;
    const limit = page ? page.limit : 10;

    let sort = { _id: -1 };  
    if (query.sortBy) {
        sort = { medicineName: 1 }; // Sort by medicineName ascending
    }

    // Aggregation pipeline
    const pipeline = [
        { $match: match }, // Match documents based on search criteria

        // Lookup for ratings
        {
            $lookup: {
                from: "ratings", // Collection name for ratings
                localField: "_id",
                foreignField: "medicineId",
                as: "ratings", // Alias for joined data
            },
        },

        // Lookup to populate `createdBy` inside ratings
        {
            $lookup: {
                from: "users", // Collection name for users
                localField: "ratings.userId",
                foreignField: "_id",
                as: "ratingUsers",
            },
        },

        // Add fields to attach user details inside ratings
        {
            $addFields: {
                ratings: {
                    $map: {
                        input: "$ratings",
                        as: "rating",
                        in: {
                            $mergeObjects: [
                                "$$rating",
                                {
                                    userId: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$ratingUsers",
                                                    as: "user",
                                                    cond: { $eq: ["$$user._id", "$$rating.userId"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },

        // Lookup for category
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryData",
            },
        },

        {
            $lookup: {
                from: "subcategories",
                localField: "subCategory",
                foreignField: "_id",
                as: "subCategoryData",
            },
        },

        // Lookup for company
        {
            $lookup: {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "companyData",
            },  
        },

        // Add fields to flatten the data
        {
            $addFields: {
                averageRating: { $avg: "$ratings.rating" }, // Calculate average rating
                totalRatings: { $size: "$ratings" }, // Count total ratings
                category: { $arrayElemAt: ["$categoryData", 0] }, // Flatten category
                company: { $arrayElemAt: ["$companyData", 0] }, // Flatten company
                subCategory: { $arrayElemAt: ["$subCategoryData", 0] },
            },
        },

        // Sort the results
        { $sort: sort },

        // Pagination settings
        { $skip: skip },
        { $limit: limit },

        // Project the fields to include in the result
        {
            $project: {
                _id: 1,
                medicineName: 1,
                medicineDetails: 1,
                price: 1,
                image: 1,
                stock: 1,
                weight: 1,
                expireDate: 1,
                manufacturerDate: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                ratings: 1,
                averageRating: 1,
                totalRatings: 1,
                category: 1,
                company: 1,
                subCategory: 1
            },
        },
    ];

    // Run the aggregation
    const items = await db.medicine.aggregate(pipeline, { collation: { locale: 'en', strength: 2 } });

    // Count total documents (without pagination)
    const count = await db.medicine.countDocuments(match);

    return {
        count,
        items,
    };
};



exports.remove = async (id) => {
    const entity = await getById(id);
    if (entity) {
        return await db.medicine.deleteOne({ _id: id });
    }
    return null;
};
