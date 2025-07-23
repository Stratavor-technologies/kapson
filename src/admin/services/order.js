const utils = require("../../../helpers/utils");
const mongoose = require("mongoose");
const _ = require("underscore");
const constants = require("../../../constants");
const { entity } = require("../../core/models/order");
const order = require("../routes/order");
const addressService = require("./address");
const paymentServices = require("./payment");
const invoiceService = require("../services/invoice");
const populate = [
  { path: "addressId" },
  { path: "userId" },
  {   path: "items.productId",
    populate: {
      path: "hsnNumber",    
      select: "gstPercentage hsnNumber"
    }, },
];

const getById = async (id) => {
  return await db.order.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
  return await db.order.findOne(condition).populate(populate);
};

const set = (model, entity) => {
  if (model.items) {
    entity.items = model.items;
  }
  if (model.userId) {
    entity.userId = model.userId;
  }
  if (model.totalAmount !== undefined) {
    entity.totalAmount = model.totalAmount;
  }
  if (model.status !== undefined) {
    entity.status = model.status;
  }

  if (model.items && model.items.length >= 0) {
    entity.items = model.items;
  }

  return entity;
};

// exports.proceedToCheckout = async (cartId, user) => {

//     const cart = await db.cart.findById(cartId)
//         .populate("items.productId")
//         .populate("userId", "username")
//         .exec();
//     if (!cart || !cart.items || cart.items.length === 0) {
//         throw { message: 'Cart is empty' };
//     }
//     // Verify stock
//     for (const item of cart.items) {
//         const product = await db.product.findById(item.productId._id);
//         if (!product || product.stock < item.quantity) {
//             throw { message: `product is not available in requested quantity` };
//         }
//     }

//     // Create order items from cart items
//     const orderItems = cart.items.map(item => ({
//         productId: item.productId._id,
//         quantity: item.quantity,
//         totalPrice: item.productId.price * item.quantity
//     }));

//     const totalAmount = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);

//     // Create order
//     const orderData = {
//         items: orderItems,
//         userId: user.id,
//         totalAmount,
//         createdBy: user.id
//     };

//     const data = await db.order.newEntity(orderData);
//     const order = await db.order.create(data);

//     // Update product stock
//     for (const item of cart.items) {
//         await db.product.findByIdAndUpdate(
//             item.productId._id,
//             { $inc: { stock: -item.quantity } }
//         );
//     }

//     // Clear the cart
//     await db.cart.findByIdAndDelete(cart._id);

//     return order;
// };

exports.proceedToCheckout = async (cartId, user, updateItems) => {
     const cart = await db.cart
       .findById(cartId)
       .populate("items.productId")        
       .populate("userId", "id role") // Only populate id and role fields
       .exec();

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }
console.log("Cart User ID:", cart.userId);
  console.log("Cart User Role:", cart.userId?.role);
  
  // Handle optional quantity updates
  if (Array.isArray(updateItems) && updateItems.length > 0) {
    for (const updateItem of updateItems) {
      // Find the item to update based on the productId
      const cartItemIndex = cart.items.findIndex(
        (item) =>
          item.productId._id.toString() === updateItem.productId.toString()
      );

      if (cartItemIndex !== -1) {
        // Log before updating the quantity for debugging
        console.log(
          `Updating product ID: ${updateItem.productId}, Old Quantity: ${cart.items[cartItemIndex].quantity}, New Quantity: ${updateItem.quantity}`
        );

        // Update the quantity if provided and ensure it's a number
        if (updateItem.quantity !== undefined) {
          const newQuantity = Number(updateItem.quantity);
          const basicPrice =
            Number(cart.items[cartItemIndex].productId.basicPrice) || 0;

          if (isNaN(newQuantity) || isNaN(basicPrice)) {
            throw new Error("Invalid quantity or price values");
          }

          cart.items[cartItemIndex].quantity = newQuantity;
          // Recalculate price for this item
          cart.items[cartItemIndex].price = basicPrice * newQuantity;
        }
      }
    }

    // Recalculate total amount after all quantity updates
    cart.totalAmount = cart.items.reduce((total, item) => {
      const itemPrice = Number(item.price) || 0;
      return total + itemPrice;
    }, 0);

    // Validate total amount before saving
    if (isNaN(cart.totalAmount)) {
      throw new Error("Invalid total amount calculation");
    }

    await cart.save();

    // Log after saving the updated cart for debugging
    console.log("Updated Cart Items:", cart.items);
  }

  // Batch fetch products to check stock availability
  const productIds = cart.items.map((item) => item.productId._id);
  const products = await db.product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((med) => [med._id.toString(), med]));

  // Verify stock availability for updated quantities
  for (const item of cart.items) {
    const product = productMap.get(item.productId._id.toString());
    if (!product || product.stock < item.quantity) {
      throw new Error(
        `product ${
          product?.name || "Unknown"
        } is not available in the requested quantity`
      );
    }
  }
  // Create order items from cart items
  const orderItems = cart.items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price) || 0; // Use the price from cart item instead of product

    if (isNaN(quantity) || isNaN(price)) {
      throw new Error("Invalid quantity or price values in cart items");
    }

    return {
      productId: item.productId._id,
      quantity: quantity,
      totalPrice: price, // Use the pre-calculated price from cart item
    };
  });

  const totalAmount = orderItems.reduce((acc, item) => {
    const itemTotal = Number(item.totalPrice) || 0;
    if (isNaN(itemTotal)) {
      throw new Error("Invalid item total price");
    }
    return acc + itemTotal;
  }, 0);

  if (isNaN(totalAmount)) {
    throw new Error("Invalid total amount calculation");
  }

  cart.totalAmount = totalAmount;
  await cart.save();


  // Create order
    const orderData = {
      items: orderItems,
      userId: cart.userId._id, // Use the populated user ID
      totalAmount: totalAmount,
      createdBy: user.id,
      isCheckout: true,
    };

    const order = await db.order.create(orderData);
          return order;

};


exports.placeOrder = async (orderId, body, user) => {
  const orderInfo = await db.order.findById(orderId);
  if (!orderInfo) {
    throw "order not found";
  }
  const latestOrder = await db.order
  .findOne({ orderNumber: { $exists: true } })
  .sort({ orderNumber: -1 })
  .select('orderNumber');

  const lastOrderNumber = latestOrder ? Number(latestOrder.orderNumber) : 0;

  const newOrderNumber = lastOrderNumber + 1;
  orderInfo.orderNumber = newOrderNumber;
  await orderInfo.save();


  const address = await addressService.create(body, user);

  if (address) {
    orderInfo.addressId = address.id;
    await orderInfo.save();
  }

   // Find and clear the user's cart
    const cart = await db.cart .findOne({ userId: user.id });
    if (cart) {
        await db.cart.findByIdAndDelete(cart._id);
    }

    // Update product stock
    for (const item of orderInfo.items) {
      await db.product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return {
      user:orderInfo.id,
      address,
       orderInfo,
       orderNumber:orderInfo.orderNumber
    };
  }
;

exports.update = async (id, model) => {
  const entity = await db.order.findById(id);
  if (!entity) {
    throw { message: constants.ORDER_NOT_FOUND };
  }

  set(model, entity);
  const totalPrice = entity.items.reduce((acc, item) => {
    return acc + item.totalPrice;
  }, 0);
  console.log();
  entity.totalPrice = totalPrice;
  const updateCart = await entity.save();
  return updateCart;
};

exports.get = async (query) => {
  if (typeof query === "string" && query.isObjectId()) {
    return getById(query);
  }

  if (query.id) {
    return getById(query.id);
  }
  if (query.userId) {
    return getByCondition({ userId: query.userId });
  }

  return null;
};

exports.search = async (query, page, user) => {
  let where = {
    status: { $eq: "PENDING" }
  };  
  
  // For default case, we'll add an additional condition that will never match
  if (user.role === "ADMIN") {
    where.userId = {
      $in: await db.user.find({ $or: [{ role: "DISTRIBUTER" }, { role: "USER" }] }).distinct("_id")
    };
  } else if (user.role === "DISTRIBUTER") {
    if(query.type == 1) {
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
  

// if (user.role === "ADMIN") {
//   // Admin can see all orders from DISTRIBUTER users
//   where = {
//     userId: {
//       $in: await db.user.find({ role: "DISTRIBUTER" }).distinct("_id")
//     }
//   };
// } else if (user.role === "DISTRIBUTER") {
//   // Distributer can see their own orders + orders from their child DEALER users
//   if(query.type == 1) {
//     where["userId"] = user._id;
//   } else {
//     // Find all DEALER users who belong to this DISTRIBUTER
//     const dealerIds = await db.user.find({ distributerId: user._id }).distinct("_id");
//     where["userId"] = { $in: dealerIds };
//   }
// } else if (user.role === "DEALER") {
//   // Dealer can only see their own orders
//   where["userId"] = user._id;
// } else if (user.role === "USER") {
//   // User can only see their own orders
//   where["userId"] = user._id;
// } else {
//   // Default case: show nothing if role is invalid
//   where = { $exists: false };
// }

  // Apply additional filters
  if (query.status) {
    if (typeof query.status === "string") {
      // Split comma-separated statuses into an array
      const statuses = query.status.split(",").map((s) => s.trim());
      where["status"] = { $in: statuses }; // Use $in for matching multiple statuses
    }
  }

  //where["isPaymentDone"] = true

  if (query.createdAt) {
    const date = new Date(query.createdAt);
    where["createdAt"] = {
      $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
      $lte: new Date(date.setHours(23, 59, 59, 999)), // End of the day
    };
  } else if (query.startDate || query.endDate) {
    where["createdAt"] = {};
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      where["createdAt"]["$gte"] = startDate;
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      where["createdAt"]["$lte"] = endDate;
    }
  }

  // Count documents matching the criteria
  const count = await db.order.countDocuments(where);

  // Fetch documents with optional pagination
  let items;
  if (page) {
    items = await db.order
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.order
      .find(where)
      .sort({ createdAt: -1 })
      .populate(populate);
  }
  const itemsWithRatings = await Promise.all(
    items.map(async (order) => {
      const orderObject = order.toObject();
      orderObject.items = await Promise.all(
        orderObject.items.map(async (item) => {
          const rating = await db.rating
            .findOne({
              productId: item.productId,
            })
            .select("rating review"); // Select both rating and review

          return {
            ...item,
            rating: rating ? rating.rating : null,
            review: rating ? rating.review : null,
          };
        })
      );
      return orderObject;
    })
  );

  return {
    count,
    items: itemsWithRatings,
  };
};


exports.remove = async (id) => {
  const entity = await db.order.findById(id);
  if (!entity) {
    throw { message: constants.USER_NOT_FOUND };
  }
  await db.order.deleteOne({ _id: id });
};

exports.shopNow = async (body, user) => {
  try {
    const { quantity, productId } = body;

    if (!quantity || !productId) {
      throw { message: constants.INVALID_INPUT };
    }

    const product = await db.product.findById(productId);
    if (!product) {
      throw { message: constants.PRODUCT_NOT_FOUND };
    }

    if (product.stock < quantity) {
      throw { message: constants.INSUFFICIENT_STOCK };
    }

    const orderItem = {
      productId: productId,
      quantity: quantity,
      totalPrice: product.price * quantity,
    };

    const orderData = {
      items: [orderItem],
      userId: user.id,
      totalAmount: orderItem.totalPrice,
      createdBy: user.id,
    };

    const data = await db.order.newEntity(orderData);
    const order = await db.order.create(data);

    product.stock -= quantity;
    await product.save();

    return {
      success: true,
      message: "Order placed successfully",
      orderId: order.id,
      totalAmount: orderData.totalAmount,
      remainingStock: product.stock,
    };
  } catch (error) {
    console.error(error.message || "Error while placing order");
    return {
      success: false,
      message: error.message || "An error occurred while placing the order",
    };
  }
};
