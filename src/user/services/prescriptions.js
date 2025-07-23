const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const prescriptionM = require("../../core/mappers/prescription");

// Helper function to map incoming model fields to the entity
const set = (model, entity) => {
    if (model.fileUrl) {
        entity.fileUrl = model.fileUrl;
    }
    if (model.status) {
        entity.status = model.status;
    }
    return entity;
};

// Create a new prescription
exports.create = async (body) => {
    const data = await db.prescription.newEntity(body);
    const entity = await db.prescription.create(data);
    return entity;
};

// Update an existing prescription by ID
exports.update = async (id, model) => {
    const entity = await db.prescription.findById(id);
    if (!entity) {
        throw { message: constants.PRESCRIPTION_NOT_FOUND };
    }

    // Set updated values
    set(model, entity);

    if (model.status === "verified") {
        entity.verifiedAt = new Date();
    }

    return await entity.save();
};

// Fetch prescription(s) based on query conditions
exports.get = async (query) => {
    if (typeof query === "string" && query.isObjectId()) {
        return db.prescription.findById(query);
    }

    if (query.id) {
        return db.prescription.findById(query.id);
    }
    if (query.userId) {
        return db.prescription.find({ userId: query.userId });
    }

    return null;
};

// Search for prescriptions based on various filters
exports.search = async (query, page) => {
    let where = {};

    if (query.search) {
        where["$or"] = [
            { fileUrl: new RegExp(query.search, "i") },
            { status: new RegExp(query.search, "i") },
        ];
    }

    const count = await db.prescription.countDocuments(where);
    let items;

    if (page) {
        items = await db.prescription
            .find(where)
            .sort({ uploadedAt: -1 })
            .skip(page.skip)
            .limit(page.limit);
    } else {
        items = await db.prescription
            .find(where)
            .sort({ uploadedAt: -1 });
    }

    return {
        count,
        items,
    };
};

// Remove a prescription by ID
exports.remove = async (id) => {
    const entity = await db.prescription.findById(id);
    if (entity) {
        return await db.prescription.deleteOne({ _id: id });
    }
    return null;
};
