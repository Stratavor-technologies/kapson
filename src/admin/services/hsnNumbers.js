const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const httpStatus = require("http-status");

const getById = async (id) => {
    return await db.hsnNumber.findById(id);
};

const getByCondition = async (condition) => {
    return await db.hsnNumber.findOne(condition);
};

const set = (model, entity) => {
    if (model.hsnNumber) {
        entity.hsnNumber = model.hsnNumber;
    }
    if (model.gstPercentage) {
        entity.gstPercentage = model.gstPercentage
    }
   
    return entity;
};

exports.create = async (body, user) => {
    const existingHsn = await db.hsnNumber.findOne({ hsnNumber: body.hsnNumber });
    if (existingHsn) {
        throw { message: constants.HSNNUMBER_ALREADY_EXISTS };
    }
    const data = await db.hsnNumber.newEntity(body);
    const entity = await db.hsnNumber.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.hsnNumber.findById(id);
    if (!entity) {
        throw { message: constants.HSNNUMBER_NOT_FOUND };
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
    if (query.search) {
        where["$or"] = [
            { name: new RegExp(query.search, "i") },
            { description: new RegExp(query.search, "i") },
        ];
    }
    const count = await db.hsnNumber.countDocuments(where);
    let items;

    if (page) {
        items = await db.hsnNumber
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
           // .populate(populate);
    } else {
        items = await db.hsnNumber
            .find(where)
            .sort({ createdAt: -1 })
            //.populate(populate);
    }
    return {
        count,
        items,
    };
};  

exports.remove = async (id) => {
    const entity = await getById(id);
    if (entity) {
        return await db.hsnNumber.deleteOne({ _id: id });
    }
    return null;
};
