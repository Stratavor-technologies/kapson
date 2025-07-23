const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const httpStatus = require("http-status");
const populate = [
    {path:"subCategory"}
]

const getById = async (id) => {
    return await db.category.findById(id);
};

const getByCondition = async (condition) => {
    return await db.category.findOne(condition);
};

const set = (model, entity) => {
    if (model.name) {
        entity.name = model.name;
    }
    if (model.categoryImage) {
        entity.categoryImage = model.categoryImage;
    }
    
    return entity;
};

exports.create = async (body, user) => {
    const existingCategory = await db.category.findOne({ name: body.name });
    if (existingCategory) {
        throw { message: constants.CATEGORY_ALREADY_EXISTS };
    }
    //body.createdBy = user.id
    const data = await db.category.newEntity(body);
    const entity = await db.category.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.category.findById(id);
    if (!entity) {
        throw { message: constants.CATEGORY_NOT_FOUND };
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
    const count = await db.category.countDocuments(where);
    let items;

    if (page) {
        items = await db.category
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
           // .populate(populate);
    } else {
        items = await db.category
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
        return await db.category.deleteOne({ _id: id });
    }
    return null;
};
