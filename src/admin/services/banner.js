const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const getById = async (id) => {
    return await db.banner.findById(id);
};
const getByCondition = async (condition) => {
    return await db.banner.findOne(condition);
};
const set = (model, entity) => {
    if (model.titleBanner) {
        entity.titleBanner = model.titleBanner;
    }
    if (model.description) {
        entity.description = model.description;
    }
    
    if (model.placement) {
        entity.placement = model.placement;
    }
    if(model.status){
        entity.status = model.status;
    }
    if(model.type){
        entity.type = model.type;
    }
    
    return entity;
};

exports.create = async (body, user) => {
 const existingBanner = await db.banner.findOne({ titleBanner: body.titleBanner });
if (existingBanner) {
    throw { message: constants.Banner_ALREADY_EXISTS };
    // return existingBanner;
}
body.createdBy = user.id
const data = await db.banner.newEntity(body);
const entity = await db.banner.create(data);
return entity;
};

exports.update = async (id, model) => {

let entity = await db.banner.findById(id);
if (!entity) {
    throw { message: constants.Banner_NOT_FOUND };
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
if (query.titleBanner) {
    return getByCondition({ titleBanner: query.titleBanner });
}

return null;
};

exports.search = async (query, page) => {
let where = {};
console.log(query.search)
if (query.search) {
    where["$or"] = [    
        { titleBanner: new RegExp(query.search, "i") },
        { bannerType: new RegExp(query.search, "i") },
    ];
}

if(query.placement){
    where["placement"] = query.placement;
}
if(query.status){
    where["status"] = query.status;
}

if(query.type) {
    where["type"] = query.type;
   }
  

const count = await db.banner.countDocuments(where);
let items;

if (page) {
    items = await db.banner
        .find(where)
        .sort({ createdAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
} else {
    items = await db.banner
        .find(where)
        .sort({ createdAt: -1 })
}

return {
    count,
    items,
};
};

exports.remove = async (id) => {
const entity = await getById(id);
if (entity) {
    return await db.banner.deleteOne({ _id: id });
}
return null;
};
