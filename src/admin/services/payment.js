const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const mongoose = require("mongoose");
const populate = [
    {path: "createdBy"},
    {path: "orderId"},
    {path: "addressId"},
    {path: "userId"},

];  

const getById = async (id) => {
    return await db.payment.findById(id) .populate('invoiceId').populate(populate);
};
const getByCondition = async (condition) => {
    return await db.payment.findOne(condition).populate(populate);
};
const set = (model, entity) => {
    if (model.orderId) {
        entity.orderId = model.orderId;
    }
    
    if (model.paymentMethod) {
        entity.paymentMethod = model.paymentMethod;
    }
    if(model.paymentStatus){
        entity.paymentStatus = model.paymentStatus;
    }
    if(model.paymentDate){
        entity.paymentDate = model.paymentDate;
    }
    if(model.amount){
        entity.amount = model.amount;
    }
    return entity;
};

// exports.create = async (body, paymentDetails, user) => {
//     // Ensure payment details are provided
//     if (!paymentDetails) {
//       throw new Error("Payment details required");
//     }
  
//     // Set the createdBy field from the current user
//     body.createdBy = user._id;
  
//     // Prepare data to save according to schema
//     const dataToSave = {
//       invoiceId: paymentDetails.invoiceId, // Store only the invoice ID
//       userId: paymentDetails.userId,
//       amount: paymentDetails.amount,
//       paymentStatus: paymentDetails.paymentStatus || "pending",
//       createdBy: body.createdBy,
//       paymentDate: new Date(),
//     };
  
//     // Save using Mongoose
//     const entity = await db.payment.create(dataToSave);
    
//     // If you need the invoice data, populate it
//     const populatedEntity = await db.payment.findById(entity._id)
//       .populate('invoiceId') // This will fetch the invoice data
//       .exec();
    
//     return populatedEntity;
// };

exports.create = async (body, paymentDetails, user) => {
    // Ensure payment details are provided
    if (!paymentDetails) {
        throw new Error("Payment details required");
    }
    
    // Set the createdBy field from the current user
    body.createdBy = user.id || user._id;
    
    // Prepare data to save according to schema
    const dataToSave = {
        userId: paymentDetails.userId,
        invoiceId: paymentDetails.invoiceId,
        addressId: paymentDetails.addressId,
        userId: paymentDetails.userId,
        amount: paymentDetails.amount,
        paymentStatus: paymentDetails.paymentStatus || "pending",
        createdBy: body.createdBy,
        paymentDate: new Date(),
        dueDate: paymentDetails.dueDate
    };
    
    // Save using Mongoose
    const entity = await db.payment.create(dataToSave);
    
    // Populate the invoice data
    const populatedEntity = await db.payment.findById(entity._id)
        .populate('invoiceId'). // This should match your schema field name
        exec();
        
    return populatedEntity;
};
exports.update = async (id, model) => {

let entity = await db.payment.findById(id);
if (!entity) {
    throw { message: constants.PAYMENT_NOT_FOUND };
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
if (query.orderId) {
    return getByCondition({ orderId: query.orderId });
}

return null;
};

exports.search = async (query, page, user) => {
    let where = {};

    // // If user is ADMIN, show all payments
    // if (user.role === "ADMIN") {
    //     const count = await db.payment.countDocuments();
    //     let items;

    //     if (page) {
    //         items = await db.payment
    //             .find({})
    //             .sort({ createdAt: -1 })
    //             .skip(page.skip)
    //             .limit(page.limit)
    //             .populate('invoiceId')
    //             .populate(populate);
    //     } else {
    //         items = await db.payment.find({}).sort({ createdAt: -1 }).populate(populate);
    //     }

    //     return {
    //         count,
    //         items,
    //     };
    // }

    // // If user is DISTRIBUTER, show their dealer payments
    // if (user.role === "DISTRIBUTER") {
    //     where.role = "DEALER";
    //     where.distributerId = user._id;
    // }

    // // For other roles, show only their own payments
    // if (user.role !== "ADMIN" && user.role !== "DISTRIBUTER") {
    //     where.createdBy = user._id;
    // }
    if (user.role === "ADMIN") {
        where.userId = {
          $in: await db.user.find({ $or: [{ role: "DISTRIBUTER" }, { role: "USER" }] }).distinct("_id")
        };
      } else if (user.role === "DISTRIBUTER") {
        if (query.type == 1) {
          where.userId = user._id;
        } else {
          const dealerIds = await db.user.find({ distributerId: user._id }).distinct("_id");
          where.userId = { $in: dealerIds };
        }
      } else if (user.role === "DEALER") {
        where.userId = user._id;
      } else if (user.role === "USER") {
        where.userId = user._id;
      } else {
        // Default case: add a condition that will never match
        where._id = { $exists: false };
      }

    // Apply search filters
    if (query.search) {
        where["$or"] = [    
            { orderId: new RegExp(query.search, "i") },
            { paymentMethod: new RegExp(query.search, "i") },
        ];
    }

    if(query.paymentStatus){
        where.paymentStatus = query.paymentStatus;
    }

    // Fetch results
    const count = await db.payment.countDocuments(where);
    let items;

    if (page) {
        items = await db.payment
            .find(where)
            .sort({ createdAt: -1 })
            .skip(page.skip)
            .limit(page.limit)
            .populate('invoiceId')
            .populate(populate);
    } else {
        items = await db.payment
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
    return await db.payment.deleteOne({ _id: id });
}
return null;
};
