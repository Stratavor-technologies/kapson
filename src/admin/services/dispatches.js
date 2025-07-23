const constants = require("../../../constants");
const io = require("../../../app").io;

const populate = [{ 
    path: "orderId",
    populate: [{
        path: "items.productId"},
        { path: "addressId" }]
    
},
    {path:"invoiceId"},
    {path:"userId"}
];
const invoiceService = require("../services/invoice");
const paymentServices = require("./payment");
const getById = async (id) => {
  return await db.dispatch.findById(id)
    // .select('+finalAmount') // Explicitly include finalAmount
    .populate(populate);
};
const getByCondition = async (condition) => {
  return await db.dispatch.findOne(condition);
};
const set = (model, entity) => {
  if (model.titledispatch) {
    entity.titledispatch = model.titledispatch;
  }

  return entity;
};

// const emitDispatchUpdate = (dispatchData, action) => {
//   io.emit('dispatch:update', {
//       data: dispatchData,
//       action: action // 'create', 'update', or 'remove'
//   });
// };

exports.create = async (body, user) => {
  // Check if dispatch with same title already exists
  const existingdispatch = await db.dispatch.findOne({
    orderId: body.orderId,
  });
  if (existingdispatch) {
    throw { message: constants.ALREADY_DISPATCHED };
  }

  body.createdBy = user.id;

  // First find the order with populated userId to get margin
  const order = await db.order.findById(body.orderId).populate('userId');
  if (!order) {
    throw { message: "Order not found" };
  }

  // Calculate GST on courier charges based on order price
  const gstOnCourier = body.gstOnCourier;
  const freightCharge = body.freightCharge;
  const ad = body.adPercent;
  const cd = body.cdPercent;
  const courierCharge = body.courierCharge;
  const totalItemPrice = order.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Calculate all the additional charges
  const courierGstAmount = (totalItemPrice * gstOnCourier) / 100;
  const adPercentAmount = (totalItemPrice * ad) / 100;
  const cdPercentAmount = (totalItemPrice * cd) / 100;

  // Calculate final total with all charges
  const totalAmount =
    totalItemPrice +
    freightCharge+
    courierGstAmount +
    adPercentAmount +
    cdPercentAmount + 
    courierCharge;

  // Calculate margin using the order's user marginPercent
  // const margin = order.userId ? (totalAmount * order.userId.marginPercent) / 100 : 0;
  // const grandTotal = totalAmount - margin;

  const margin = order.userId && order.userId.marginPercent ? (totalAmount * order.userId.marginPercent) / 100 : 0;
  const grandTotal = totalAmount - margin;

  // Create invoice details
  const invoiceDetails = {
    userId: user.id,
    orderId: order.id,
    totalAmount: grandTotal,
    invoiceDate: new Date(2025, 0, 20),
  };

  // Create and save invoice
  const invoiceData = await invoiceService.create(invoiceDetails, user);
  await invoiceData.save();

  // Store the complete invoice object in dispatch
  const invoiceObject = invoiceData.toObject
    ? invoiceData.toObject()
    : JSON.parse(JSON.stringify(invoiceData));


   // First part - Setting up payment details
const paymentDetails = {
  invoiceId: invoiceData.id,  // Changed from invoiceData to invoiceId for consistency
  userId: order.userId,
  amount: grandTotal,
  paymentStatus: "pending",
  //addressId: String(order.addressId._id),
  dueDate: body.dueDate
};

// Call payment service to create payment - no need to modify body
const payment = await paymentServices.create(body, paymentDetails, user);

// Convert to object if needed
const paymentObject = payment.toObject    
  ? payment.toObject()
  : JSON.parse(JSON.stringify(payment));

  // Update order items with bundles and cartons
  if (body.items && Array.isArray(body.items)) {
    for (const updateItem of body.items) {
      const orderItem = order.items.find(
        item => item.productId.toString() === updateItem.productId.toString()
      );

      if (orderItem) {
        orderItem.bundles = updateItem.bundles;
        orderItem.cartons = updateItem.cartons;
        orderItem.totalWeight = updateItem.totalWeight;
      }
    }
    await order.save();
  }

  // Remove items array from body to avoid storing in dispatch
  const { items: _, ...bodyWithoutItems } = body;

  const data = await db.dispatch.newEntity({
    ...bodyWithoutItems,
    userId: order.userId,
    invoiceId: invoiceData._id || invoiceData.id, // Store ID for reference
    invoiceData: invoiceObject, // Store the complete invoice object
    grandTotal,
    courierGstAmount,
    adPercentAmount,
    cdPercentAmount,
    payment: paymentObject,
    margin
  });

  // Create the dispatch record
  const newDispatch = await db.dispatch.create(data);
  
  if (body.orderId) {
    await db.order.updateOne({ _id: body.orderId }, { $set: { status: "DISPATCHED" } });
  }

  
  // Return the populated dispatch to ensure invoice data is included
  const populatedDispatch = await db.dispatch.findById(newDispatch._id).exec();
  
// emitDispatchUpdate(populatedDispatch, 'create');
  return populatedDispatch;
};

exports.update = async (id, model) => {
  let entity = await db.dispatch.findById(id);
    if (!entity) {
      throw { message: constants.dispatch_NOT_FOUND };
  }

  entity = set(model, entity);
  const updatedDispatch = await entity.save();
 // emitDispatchUpdate(updatedDispatch, 'update');
  return updatedDispatch;
};

  exports.get = async (query) => {
  if (typeof query === "string" && query.isObjectId()) {
    return getById(query);
  }

  if (query.id) {
    return getById(query.id);
  }
  if (query.titledispatch) {
    return getByCondition({ titledispatch: query.titledispatch });
  }

  return null;
};

// exports.search = async (query, page,user) => {
//   let where = {};
//   // where = {
//   //   userId: user._id
//   // };

//   if (query.search) {
//     where["$or"] = [{ customerName: new RegExp(query.search, "i") }];
//   }

//   const count = await db.dispatch.countDocuments(where);
//   let items;

//   if (page) {
//     items = await db.dispatch
//       .find(where)
//       .sort({ createdAt: -1 })
//       .skip(page.skip)
//       .limit(page.limit)
//       .populate(populate);
//   } else {
//     items = await db.dispatch.find(where).sort({ createdAt: -1 });
//   }

//   return {
//     count,
//     items,
//   };
// };

exports.search = async (query, page, user) => {
  let where = {};
  
  // Apply role-based filtering based on user role
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

  // Apply search filter if provided
  if (query.search) {
    where["$or"] = [{ customerName: new RegExp(query.search, "i") }];
  }

  const count = await db.dispatch.countDocuments(where);
  let items;

  if (page) {
    items = await db.dispatch
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.dispatch.find(where).sort({ createdAt: -1 }).populate(populate);
  }

  return {
    count,
    items,
  };
};

exports.remove = async (id) => {
  const entity = await getById(id);
  if (entity) {
    return await db.dispatch.deleteOne({ _id: id });
  }
  return null;
};  
