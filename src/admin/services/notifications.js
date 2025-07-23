const _ = require("underscore");
const constants = require("../../../constants");
const populate = [
    { path: "userId" }
]

const getById = async (id) => {
    return await db.notification.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.notification.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.userId) {
        entity.userId = model.userId;
    }
    if (model.validTill) {
        entity.validTill = model.validTill;
    }
   if (model.notificationHeading) {
    entity.notificationHeading = model.notificationHeading
    }
    if (model.notification) {
        entity.notification = model.notification
    }
    return entity;
};

exports.create = async (body, user) => {
    const existingnotification = await db.notification.findOne({ notification: body.notificationHeading });
    if (existingnotification) {
        throw { message: constants.NOTIFICATION_ALREADY_EXISTS };
    }
    const data = await db.notification.newEntity(body);
    const entity = await db.notification.create(data);
    return entity;
};

exports.update = async (id, model) => {
    const entity = await db.notification.findById(id);
    if (!entity) {
        throw { message: constants.NOTIFICATION_NOT_FOUND };
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
    const count = await db.notification.countDocuments(where);
    let items;

    if (page) {
        items = await db.notification
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
           // .populate(populate);
    } else {
        items = await db.notification
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
        return await db.notification.deleteOne({ _id: id });
    }
    return null;
};
