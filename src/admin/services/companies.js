const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const httpStatus = require("http-status");

//const populate = ["createdBy"];  // Populating the user who created the company

const getById = async (id) => {
    return await db.company.findById(id);
};

const getByCondition = async (condition) => {
    return await db.company.findOne(condition);
};

const set = (model, entity) => {
    if (model.companyName) {
        entity.companyName = model.companyName;
    }
    if (model.logo) {
        entity.logo = model.logo;
    }
    if (model.revenue) {
        entity.revenue = model.revenue;
    }
    if (model.numberOfProducts) {
        entity.numberOfProducts=model.numberOfProducts
    }
    if (model.customerRating) {
        entity.customerRating = model.customerRating
    }
    return entity;
};

exports.create = async (body, user) => {
        const existingCompany = await db.company.findOne({ companyName: body.companyName });
    if (existingCompany) {
        throw { message: constants.COMPANY_ALREADY_EXISTS};
    }
    body.createdBy = user.id
    const data = await db.company.newEntity(body);
    const entity = await db.company.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.company.findById(id);
    if (!entity) {
        throw { message: constants.COMPANY_NOT_FOUND };
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

    const count = await db.company.countDocuments(where);
    let items;
    let sort = { createdAt: -1 };
    if(query.sortBy){
        sort = {customerRating: -1}
    } else if(query.sortBySale){
        sort = {revenue: -1}
    }
    if (page) {
        items = await db.company
            .find(where)
            .sort(sort)
            .skip(page.skip)
            .limit(page.limit)
            
    } else {
        items = await db.company
            .find(where)
            .sort(sort)
            
    }
    return {
        count,
        items,
    };
};

exports.remove = async (id) => {
    const entity = await getById(id);
    if (entity) {
        return await db.company.deleteOne({ _id: id });
    }
    return null;
};
