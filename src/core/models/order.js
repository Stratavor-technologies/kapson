const mongoose = require("mongoose");

const orderEntity = {
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      
    },
    quantity: {
      type: Number,
   
    },
    cartons: {
       type: Number ,
       default: null
      },
    bundles: { 
      type: Number,
      default: null
     },
     totalWeight:{
      type: String,
      default: null
     },
    totalPrice: {
      type: Number,
    }
  }],
  totalAmount: {
    type: Number,
  },
  orderNumber: {
    type:String
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'address'
  },
 
  orderDetails: {
    orderNo: {
      type: String,
      
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    },orderAmount: {
    
    discount: {
      type: String
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",  // Assuming this refers to the buyer
    
  },
  status: {
    type:String,
    enum: ['PENDING', 'PROCESSING','DISPATCHED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

};

let orderStatics = {};

orderStatics.newEntity = async (body) => {
  const model = {
    items: body.items,
    totalAmount: body.totalAmount,
    addressId:body.addressId,
    orderDetails: body.orderDetails,
    orderAmount: body.orderAmount,
    status: body.status,
    
  };

  return model;
};



module.exports = {
  entity: orderEntity,
  statics: orderStatics,

};
