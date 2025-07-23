const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const mongoose = require("mongoose");
const populate = [
    {
       path:"medicineId",
        
    },
    {
        path:"userId",
         
     },

];

const getById = async (id) => {
    return await db.rating.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.rating.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.medicineId) {
        entity.medicineId = model.medicineId;
    }
    if (model.rating) {
        entity.rating = model.rating;
    }
    if (model.review) {
        entity.review = model.review;
    }
    return entity;
};

exports.create = async (body, user) => {
     const existingRating = await db.rating.findOne({ medicineId: body.medicineId , userId: user._id});
    if (existingRating) {
        throw { message: constants.RATING_ALREADY_EXISTS };
    }
    const isMedicine = await db.medicine.findOne({_id:body.medicineId });
    body.createdBy = isMedicine.createdBy
    body.userId = user._id
    const data = await db.rating.newEntity(body);
    const entity = await db.rating.create(data);
    return entity;  
};

exports.update = async (id, model) => {
    const entity = await db.rating.findById(id);
    if (!entity) {
        throw { message: constants.RATING_NOT_FOUND };
    }

    set(model, entity);
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
    let where = {};
    if (query.medicineId) {
        where["medicineId"] = new mongoose.Types.ObjectId(query.medicineId);
    }
    if (query.userId) {
        where["userId"] = new mongoose.Types.ObjectId(query.userId);
    }
if (query.search) {
    where["$or"] = [
        { name: new RegExp(query.search, "i") },
        { description: new RegExp(query.search, "i") },
    ];
}
    // if (query.userId) {
    //     where.userId = query.userId;
    // }
    // if (query.medicineId) {
    //     where.medicineId = query.medicineId;
    // }
    const count = await db.rating.countDocuments(where);
    let items;

    if (page) {
        items = await db.rating
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
            .populate(populate);
    } else {
        items = await db.rating
            .find(where)
            .sort({ createdAt: -1 })
            .populate(populate);
    }

    return {
        count,
        items,
    };
};



exports.remove = async (id) => {
    const entity = await getById(id);
    if (entity) {
        return await db.rating.deleteOne({ _id: id });
    }
    return null;
};
