const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const { entity } = require("../../core/models/address");
const populate = ["createdBy"];  // Populating the user who created
const mongoose = require("mongoose")
const getById = async (id) => {
    return await db.address.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.cart.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.firstName) {
        entity.firstName = model.firstName;
    }
    if (model.lastName) {
        entity.lastName = model.lastName;
    }
    if (model.companyName) {
        entity.companyName = model.companyName;
    }
    if (model.address) {
        entity.address = model.address;
    }
    if (model.country) {
        entity.country = model.country;
    }
    if (model.countryCode) {
        entity.countryCode= model.countryCode;
    }
    if (model.state) {
        entity.state = model.state;
    }
    if (model.city) {
        entity.city = model.city;
    }
    if (model.zipCode) {
        entity.zipCode = model.zipCode;
    }
    if (model.phoneNumber) {
        entity.phoneNumber = model.phoneNumber;
    }
    if (model.email) {
        entity.email = model.email;
    }
    return entity;
};

exports.create = async (body, user) => {
    const existingAddress = await db.address.findOne({ partyDetails: body.partyDetails });
    if (existingAddress) {
        // throw { message: constants.ADDRESS_ALREADY_EXISTS };
        return existingAddress
    }
     body.createdBy = user.id
    const data = await db.address.newEntity(body);
    const entity = await db.address.create(data);
    return entity
};

exports.update = async (id, model) => {
    const entity = await db.address.findById(id);
    if (!entity) {
        throw { message: constants.ADDRESS_NOT_FOUND };
    }

    set(model, entity);
    const updateAddress = await entity.save();
    return updateAddress;
};

exports.get = async (query) => {
    if (typeof query === "string" && query.isObjectId()) {
        return getById(query);
    }

    if (query.id) {
        return getById(query.id);
    }
    if (query.email) {
        return getByCondition({ email: query.email });
    }


    return null;
};

exports.search = async (query, page) => {
    let where = {};
    if (query.search) {
        where["$or"] = [
            { firstName: new RegExp(query.search, "i") },
            { lastName: new RegExp(query.search, "i") },
        ];
    }
    if (query.userId) {
        where.createdBy = query.userId
    }
    const count = await db.address.countDocuments(where);
    let items;

    if (page) {
        items = await db.address
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
            .populate(populate);
    } else {
        items = await db.address
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
    try {

        const isAddress = await db.address.findOneAndDelete({ _id: id });

        if (isAddress) {
            return {
                success: true,
                message: 'Address deleted successfully'

            };
        } else {
            return {
                success: false,
                message: 'Address not found'
            };
        }
    } catch (error) {

        return {
            success: false,
            message: 'An error occurred while deleting the address',
            error: error.message
        };
    }
};
