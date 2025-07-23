"use strict";
const path = require("path");
const coreDirname = path.join(__dirname, "..", "..", "core", "api");
const base = require("../../../api/api-base")(
  __dirname,
  "carts",
  "cart",
  coreDirname
);
const service = require("../services/carts");

exports.search = async (req, res) => {
  let retVal = await base.search(req);
  return res.page(retVal);
};
exports.update = async (req, res) => {
  let retVal = await base.update(req);
  return res.data(retVal);
};

exports.get = async (req, res) => {
  let retVal = await base.get(req);
  return res.data(retVal);
};

// exports.addToCart = async (req, res) => {
//   try {
//     let { productId, quantity } = req.body.items[0];
//     if (!productId || !quantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Product ID and quantity are required",
//       });
//     }

//     let retVal = await service.addToCart(productId, quantity, req);
//     return res.status(200).json({
//       success: true,
//       data: retVal,
//     });
//   } catch (error) {
//     return res.status(error.status || 500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

exports.addToCart = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    // Validate each item has the required fields
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Product ID and quantity are required for each item",
        });
      }
    }

    // Process all items
    const result = await service.addToCart(items, req);
    
    return res.status(result.code).json({
      success: result.isSuccess,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    if (!req.params.id || !req.body.productId) {
      return res.status(400).json({
        success: false,
        message: "Cart ID and prductID are required",
      });
    }

    let retVal = await service.removeFromCart(req.body, req.params.id);
    return res.status(200).json({
      success: true,
      data: retVal,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getCartByToken= async (req,res)=>{
try {
  let cart = await db.cart.findOne({userId: req.user.id}).populate({
    path: "items.productId",
    populate: {
      path: "hsnNumber",    
      select: "gstPercentage hsnNumber"
    },
   
  });
  return res.data(cart);
} catch (error) {
  return res.failure(error);
}
};

exports.removeItems = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cart ID and Product ID are required",
      });
    }

    let retVal = await service.removeItems(req.body, req.params.id);
    return res.status(200).json({
      success: true,
      data: retVal,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

