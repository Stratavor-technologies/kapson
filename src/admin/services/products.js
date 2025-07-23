const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const Product = require("../../core/models/product").model;
const mongoose =  require("mongoose")
const populate = [ 
    { path:"category" },
    {path: "subCategory"},
    {path: "hsnNumber"}
];

const getById = async (id) => {
    return await db.product.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.product.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.productName) {
        entity.productName = model.productName;
    }
    if (model.productImage) {
        entity.productImage = model.productImage;
    }
    if (model.ArtNumber) {
        entity.ArtNumber = model.ArtNumber;
    }
    if (model.category) {
        entity.category = model.category;
    }
    if (model.subCategory) {
        entity.subCategory = model.subCategory;
    }
    if (model.hsnNumber) {
        entity.hsnNumber = model.hsnNumber;
    }
    if (model.mrp) {
        entity.mrp = model.mrp;
    }
    if (model.basicPrice) {
        entity.basicPrice = model.basicPrice;
    }
    if (model.productDescription) {
        entity.productDescription = model.productDescription;
    }
    if (model.productFeature) {
        entity.productFeature = model.productFeature;
    }
    if (model.applicationDetails) {
        entity.applicationDetails = model.applicationDetails;
    }
    if (model.packagingDetails) {
        entity.packagingDetails = model.packagingDetails;
    }
    return entity;
};

exports.create = async (body, user) => {
    const existingProduct = await db.product.findOne({ productName: body.productName });
    if (existingProduct) {
        return existingProduct;
    }
   // body.createdBy = user.id
    const data = await db.product.newEntity(body);
    const entity = await db.product.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.product.findById(id);
    if (!entity) {
        throw { message: constants.PRODUCT_NOT_FOUND };
    }

    set(model, entity);
    const updateproduct = await entity.save();
    return updateproduct;
};

exports.get = async (query) => {
    if (typeof query === "string" && query.isObjectId()) {
        return getById(query);
    }

    if (query.id) {
        return getById(query.id);
    }
    if (query.name) {
        return getByCondition({ productName: query.productName });
    }

    return null;
};

exports.search = async (query, page) => {
    let match = {
        stock: { $gt: 0 } // Only include products that are in stock
    };
    
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
    if (query.productName) {
        match["productName"] = new RegExp(query.productName, "i");
    }
    
    if (query.search) {
        match["$or"] = [
            { productName: new RegExp(query.search, "i") },
            { productDetails: new RegExp(query.search, "i") },
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
        sort = { productName: 1 }; // Sort by productName ascending
    }

    // Aggregation pipeline
    const pipeline = [
        { $match: match }, // Match documents based on search criteria

        // Lookup for ratings
        {
            $lookup: {
                from: "ratings", // Collection name for ratings
                localField: "_id",
                foreignField: "productId",
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
                from: "hsnnumbers", // MongoDB collection names are lowercase
                localField: "hsnNumber",
                foreignField: "_id",
                as: "hsnNumberData",
            },
        },  
        // Add fields to flatten the data
        {
            $addFields: {
                averageRating: { $avg: "$ratings.rating" }, // Calculate average rating
                totalRatings: { $size: "$ratings" }, // Count total ratings
                category: { $arrayElemAt: ["$categoryData", 0] }, // Flatten category
                hsnNumber: { $arrayElemAt: ["$hsnNumberData", 0] }, // Flatten HSN number
                subCategory: { $arrayElemAt: ["$subCategoryData", 0] }
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
                productName: 1,
                productDetails: 1,
                price: 1,
                stock: 1,
                ArtNumber: 1,
                productImage: 1,
                mrp: 1,
                basicPrice: 1,
                productDescription: 1,
                productFeature: 1,
                applicationDetails: 1,
                packagingDetails:1,
                weight: 1,
                expireDate: 1,
                updatedAt: 1,
                category: 1,
                subCategory: 1,
                subCategory: {
                    _id: 1,
                    name: 1,
                    categoryImage: 1,
                    updatedAt: 1,
                    createdAt: 1
                },
                hsnNumber: {
                    _id: 1,
                    hsnNumber: 1,
                    gstPercentage: 1
                }
            },
        },
    ];

    // Run the aggregation
    const items = await db.product.aggregate(pipeline, { collation: { locale: 'en', strength: 2 } });

    // Count total documents (without pagination)
    const count = await db.product.countDocuments(match);

    return {
        count,
        items,
    };
};

exports.remove = async (id) => {
    try {
        const isproduct = await db.product.findOneAndDelete({ _id: id });

        if (isproduct) {
            return {
                success: true,
                message: 'product deleted successfully'
            };
        } else {
            return {
                success: false,
                message: 'product not found'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'An error occurred while deleting the product',
            error: error.message
        };
    }
};
