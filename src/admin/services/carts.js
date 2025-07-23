const utils = require("../../../helpers/utils");
const _ = require("underscore");
const constants = require("../../../constants");
const mongoose = require("mongoose");
const { entity } = require("../../core/models/order");
const getById = async (id) => {
  return await db.cart.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
  return await db.cart.findOne(condition).populate(populate);
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

exports.update = async (id, model) => {
  const entity = await db.cart.findById(id);
  if (!entity) {
    throw { message: constants.CART_NOT_FOUND };
  }

  // Check if we have items to update
  if (!model.items || !Array.isArray(model.items) || model.items.length === 0) {
    throw { message: "No items provided for update" };
  }

  // First, validate all quantities and get product prices
  const productPrices = new Map();
  for (const item of model.items) {
    if (item.quantity <= 0) {
      throw { message: `Invalid quantity (${item.quantity}) for product ${item.productId}` };
    }
    
    // Get product price for new items or price updates
    const product = await db.product.findById(item.productId).populate("hsnNumber");
    if (!product) {
      throw { message: `Product with ID ${item.productId} not found` };
    }

    // Calculate GST and total price
    const gstRate = product.hsnNumber?.gstPercentage || 0;
    const basicPrice = Number(product.basicPrice) || 0;
    const gstAmount = (basicPrice * gstRate) / 100;
    const totalPricePerUnit = basicPrice + gstAmount;
    const itemTotalPrice = totalPricePerUnit * item.quantity;

    productPrices.set(item.productId.toString(), {
      price: itemTotalPrice,
      gstRate,
      gstAmount: gstAmount * item.quantity
    });
  }

  // Update each item in the cart
  for (const newItem of model.items) {
    const { productId, quantity } = newItem;
    
    // Find existing item in cart
    let cartItem = entity.items.find(item => item.productId.toString() === productId);
    
    if (cartItem) {
      // Update quantity and recalculate price
      const priceInfo = productPrices.get(productId.toString());
      if (!priceInfo) {
        throw { message: `Price not found for product ${productId}` };
      }

      cartItem.quantity = quantity;
      cartItem.price = priceInfo.price;
      cartItem.gstRate = priceInfo.gstRate;
      cartItem.gstAmount = priceInfo.gstAmount;
    } else {
      // Add new item with price from our cached prices
      const priceInfo = productPrices.get(productId.toString());
      if (!priceInfo) {
        throw { message: `Price not found for product ${productId}` };
      }
      
      entity.items.push({
        productId,
        quantity,
        price: priceInfo.price,
        gstRate: priceInfo.gstRate,
        gstAmount: priceInfo.gstAmount
      });
    }
  }

  // Recalculate total amount by summing up all item prices
  entity.totalAmount = entity.items.reduce((total, item) => {
    if (item.price != null) {
      const itemPrice = Number(item.price);
      if (!isNaN(itemPrice)) {
        return total + itemPrice;
      }
    }
    return total;
  }, 0);

  const updatedCart = await entity.save();
  return updatedCart;
};

exports.addToCart = async (items, req) => {
  try {
    if (!req.user || !req.user.id) {
      const error = new Error(constants.INVALID_CREDENTIALS);
      error.status = 401;
      throw error;
    }

    let cart = await db.cart.findOne({ userId: req.user.id }).exec();
    if (!cart) {
      // Create a new cart if none exists
      cart = new db.cart({
        userId: req.user.id,
        items: [],
        totalAmount: 0
      });
    }

    // Process each item
    for (const item of items) {
      const { productId, quantity } = item;
      
      const product = await db.product
        .findById(productId)
        .populate("hsnNumber"); // Fetch GST details

      if (!product) {
        return {
          isSuccess: false,
          code: 404,
          message: `Product with ID ${productId} not found`
        };
      }

      if (product.stock === 0) {
        return {
          isSuccess: false,
          code: 400,
          message: `Product ${product.name} is out of stock`
        };
      }

      if (product.stock < quantity) {
        return {
          isSuccess: false,
          code: 400,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units available`
        };
      }

      // Fetch GST rate from the HSN document
      const gstRate = product.hsnNumber?.gstPercentage || 0;
      if (isNaN(gstRate)) throw new Error("Invalid GST rate");

      // Calculate base price and GST
      const basicPrice = Number(product.basicPrice) || 0;
      if (isNaN(basicPrice)) throw new Error("Invalid product price");

      const newQuantity = Number(quantity);
      if (isNaN(newQuantity)) throw new Error("Invalid quantity");

      const gstAmount = (basicPrice * gstRate) / 100; // GST per unit
      const totalPricePerUnit = basicPrice + gstAmount; // Price including GST
      const itemTotalPrice = totalPricePerUnit * newQuantity; // Final price for quantity

      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.productId.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const existingItem = cart.items[existingItemIndex];
        const updatedQuantity = existingItem.quantity + newQuantity;
        const updatedItemTotalPrice = totalPricePerUnit * updatedQuantity;

        cart.items[existingItemIndex].quantity = updatedQuantity;
        cart.items[existingItemIndex].price = updatedItemTotalPrice;
        cart.items[existingItemIndex].gstAmount = gstAmount * updatedQuantity;
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity: newQuantity,
          price: itemTotalPrice,
          gstRate,
          gstAmount: gstAmount * newQuantity,
        });
      }

      // Update product stock
      product.stock -= newQuantity;
      await product.save();
    }

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
    await cart.save();

    return {
      isSuccess: true,
      code: 200,
      message: "Items added to cart successfully",
      data: {
        userId: cart.userId,
        cartId: cart._id,
        totalAmount: cart.totalAmount.toFixed(2),
        itemCount: cart.items.length,
        items: cart.items
      }
    };
  } catch (error) {
    return {
      isSuccess: false,
      code: error.status || 500,
      message: error.message || "An unexpected error occurred",
      data: {}
    };
  }
};

exports.removeFromCart = async (body, cartId) => {
  const productId = body.productId;

  const cart = await db.cart.findOne({ _id: cartId });
  if (!cart || cart.items.length === 0) {
    const error = new Error(constants.CART_NOT_FOUND);
    error.status = 404;
    throw error;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex === -1) {
    const error = new Error(constants.PRODUCT_NOT_FOUND);
    error.status = 404;
    throw error;
  }
  let product = await db.product.findById(productId)

  // Get the item being removed
  let removedItem = cart.items[itemIndex];
  if (removedItem.quantity === body.quantity) {
    // Remove item from cart
    cart.items.splice(itemIndex, 1)
  }
  else {
    removedItem.quantity -= body.quantity
    removedItem.price= product.basicPrice * removedItem.quantity 
    await removedItem.save()
  }
  if (cart.items.length === 0) {
  await db.cart.deleteOne({ _id: cartId});
    return {
      message: "Cart has been deleted as it is empty.",
      totalAmount: 0,
    };
  }
  
  // Recalculate total amount
  cart.totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0);

  const updatedCart = await cart.save();

  return {
    removedItem: {
      productId: removedItem.productId,
      quantity: removedItem.quantity,
      price: removedItem.price,
    },
    totalAmount: updatedCart.totalAmount,
  };
};


exports.search = async (query, page, user) => {
  let where = {};
  if (query.search) {
    where["$or"] = [
      { name: new RegExp(query.search, "i") },
      { description: new RegExp(query.search, "i") },
    ];
  }
  const count = await db.cart.countDocuments(where);
  let items;

  if (page) {
    items = await db.cart
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
    //.populate(populate);
  } else {
    items = await db.cart.find(where).sort({ createdAt: -1 });
    //.populate(populate);
  }

  return {
    count,
    items,
  };
};

exports.removeItems = async (body, cartId) => {
  const productId = body.productId;

  const cart = await db.cart.findOne({ _id: cartId });
  if (!cart || cart.items.length === 0) {
    const error = new Error(constants.CART_NOT_FOUND);
    error.status = 404;
    throw error;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex === -1) {
    const error = new Error(constants.PRODUCT_NOT_FOUND);
    error.status = 404;
    throw error;
  }
 // let product = await db.product.findById(productId)

  // Get the item being removed
  let removedItem = cart.items[itemIndex];
  removedItem.quantity === body.quantity
    // Remove item from cart
    cart.items.splice(itemIndex, 1)

  
  // Recalculate total amount
  cart.totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0);

  const updatedCart = await cart.save();

  return {
    removedItem: {
      productId: removedItem.productId,
      quantity: removedItem.quantity,
      price: removedItem.price,
    },
    totalAmount: updatedCart.totalAmount,
  };
};
