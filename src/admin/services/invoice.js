const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const { query } = require("express");
const mongoose = require("mongoose")

const populate = [
    { path: "userId" },
    { path: "orderId" ,
    populate: { path: "items.productId" } 
    },
    { path: "paymentId" },
];

const getById = async (id) => {
    return await db.invoice.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.invoice.findOne(condition).populate(populate);
};

const set = (model, entity) => {
    if (model.invoiceId) {
        entity.invoiceId = model.invoiceId;
    }
    if (model.customerName) {
        entity.customerName = model.customerName;
    }
    if (model.invoiceDate) {
        entity.invoiceDate = model.invoiceDate;
    }
    if (model.totalItems) {
        entity.totalItems = model.totalItems;
    }
    if (model.totalAmount) {
        entity.totalAmount = model.totalAmount;
    }
    if (model.paymentStatus) {
        entity.paymentStatus = model.paymentStatus;
    }
    if (model.deliveryStatus) {
        entity.deliveryStatus = model.deliveryStatus;
    }
    return entity;
};


exports.create = async (invoiceDetails, user) => {
    if (!invoiceDetails) {
        throw new Error("invoice detail is required");
    }
    // const existingInvoice = await db.invoice.findOne({
    //     orderId: invoiceDetails.orderId,
        
    // });
         
    // if (existingInvoice) {
    //     throw new Error("An invoice with similar details already exists");
    // }
    
    let invoiceId = 0
   const lastInvoice = await db.invoice.findOne({}, {}, { sort: { invoiceId: -1 } });
    if (lastInvoice) {
        invoiceId = lastInvoice.invoiceId
    }
    const newInvoiceId = utils.generateUniqueNum(invoiceId);
    const body = { ...invoiceDetails };
    body.invoiceId = newInvoiceId;
    body.createdBy = user.id;
    body.createdAt = new Date();
    const data = await db.invoice.newEntity(body);
    const entity = await db.invoice.create(data);

    const populatedEntity = await db.invoice.findById(entity.id).populate(populate);
    return populatedEntity;
}


exports.update = async (id, model) => {

    let entity = await db.invoice.findById(id);
    if (!entity) {
        throw { message: constants.INVOICE_NOT_FOUND };
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
    if (query.name) {
        return getByCondition({ name: query.name });
    }

    return null;
};

exports.search = async (query, page) => {
    let where = {};
     if (query.invoiceId) {
            where["_id"] = new mongoose.Types.ObjectId(query.invoiceId);
        }
        if (query.orderId) {
            where["orderId"] = new mongoose.Types.ObjectId(query.orderId);
        }
        if (query.invoiceType) {
            where["invoiceType"] = query.invoiceType;
        }
    // if (query.search) {
    //     where["$or"] = [
    //         { invoiceId: new RegExp(query.search, "i") },
    //         { customerName: new RegExp(query.search, "i") },
    //     ];
    // }

    const count = await db.invoice.countDocuments(where);
    let items;

    if (page) {
        items = await db.invoice
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
            .populate(populate);
    } else {
        items = await db.invoice
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
        return await db.invoice.deleteOne({ _id: id });
    }
    return null;
};
