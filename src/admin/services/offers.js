const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const httpStatus = require("http-status");

const populate = [
    { path: "userId" }
];

const getById = async (id) => {
    return await db.offer.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.offer.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.userId) {
        entity.userId = model.userId;
    }
    if (model.offerStartsOn) {
        entity.offerStartsOn = model.offerStartsOn;
    }
   if (model.offerEndsOn) {
    entity.offerEndsOn = model.offerEndsOn
    }
    if (model.offerHeading) {
        entity.offerHeading = model.offerHeading
    }
      if (model.offerDetails) {
        entity.offerDetails = model.offerDetails
    }

    return entity;
};

exports.create = async (body, user) => {
    const existingoffer = await db.offer.findOne({ offer: body.offerHeading });
    if (existingoffer) {
        throw { message: constants.OFFER_ALREADY_EXISTS };
    }
    const data = await db.offer.newEntity(body);
    const entity = await db.offer.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.offer.findById(id);
    if (!entity) {
        throw { message: constants.OFFER_NOT_FOUND };
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
    const count = await db.offer.countDocuments(where);
    let items;

    if (page) {
        items = await db.offer
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
           .populate(populate);
    } else {
        items = await db.offer
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
        return await db.offer.deleteOne({ _id: id });
    }
    return null;
};
