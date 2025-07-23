const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const mongoose = require("mongoose");
const { query } = require("express");
const { name } = require("mustache");

const populate = [{ path: "category" }]; // Populating the user who created the subcategory and the parent category

const getById = async (id) => {
  return await db.subCategory.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
  return await db.subCategory.findOne(condition).populate(populate);
};

const set = (model, entity) => {
  if (model.name) {
    entity.name = model.name;
  }
  if (model.image) {
    entity.image = model.image;
  }
  if (model.isActive !== undefined) {
    entity.isActive = model.isActive;
  }
  return entity;
};

exports.create = async (body, user) => {
  const existingSubcategory = await db.subCategory.findOne({ name: body.name });
  if (existingSubcategory) {
    throw { message: constants.SUBCATEGORY_ALREADY_EXISTS };
  }
  //  body.createdBy = new mongoose.Types.ObjectId(user.id)

  const data = await db.subCategory.newEntity(body);
  const entity = await db.subCategory.create(data);
  return entity;
};

exports.update = async (id, model) => {
  const entity = await db.subCategory.findById(id);
  if (!entity) {
    throw { message: constants.SUBCATEGORY_NOT_FOUND };
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
  if (query.categoryId) {
    return getByCondition({ categoryId: query.categoryId });
  }

  return null;
};

exports.search = async (query, page) => {
  let where = {};
  if (query.categoryId) {
    where["category"] = new mongoose.Types.ObjectId(query.categoryId);
  }
  if (query.search) {
    where["$or"] = [
      { name: new RegExp(query.search, "i") },
      { description: new RegExp(query.search, "i") },
    ];
  }

  const count = await db.subCategory.countDocuments(where);
  let items;

  if (page) {
    items = await db.subCategory
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.subcategory
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
    return await db.subCategory.deleteOne({ _id: id });
  }
  return null;
};
