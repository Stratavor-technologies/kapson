const _ = require("underscore");
const constants = require("../../../constants");
const populate = ["createdBy",];  // Populating the user who created the membership
const payment= require('../../../helpers/paymentGateway');

const getById = async (id) => {
  return await db.membership.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
  return await db.membership.findOne(condition).populate(populate);
};

const set = (model, entity) => {
  if (model.membershipName) {
    entity.membershipName = model.membershipName;
  }
  if (model.membershipDescription) {
    entity.membershipDescription = model.membershipDescription;
  }
  if (model.membershipDuration) {
    entity.membershipDuration = model.membershipDuration;
  }
  if (model.membershipType) {
    entity.membershipType = model.membershipType;
  }
  if (model.membershipFrom) {
    entity.membershipFrom = model.membershipFrom
  }
  if (model.membershipTo) {
    entity.membershipTo = model.membershipTo
  }
  if (model.price) {
    entity.price = model.price
  }
  return entity;
};


exports.create = async (body, user) => {
  
    const { entity } = await payment.createMembership(body, user);

    // Step 2: Create Stripe Product and Price
    const updatedEntity = await payment.createStripeMembershipResources(entity, body.membershipDuration);

    return updatedEntity;

}

exports.update = async (id, model) => {
  const entity = await db.membership.findById(id);
  if (!entity) {
    throw { message: constants.MEMBERSHIP_NOT_FOUND };
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
      { membershipName: new RegExp(query.search, "i") },
      { membershipDescription: new RegExp(query.search, "i") },
    ];

  }
  const count = await db.membership.countDocuments(where);
  let items;

  if (page) {
    items = await db.membership
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.membership
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
    return await db.membership.deleteOne({ _id: id });
  }
  return null;
};
