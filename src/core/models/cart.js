const { number } = require("joi");
const mongoose = require("mongoose");

const cartEntity = {
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }], 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    totalAmount: {
        type: Number,
        required: true
    },
     createdAt: {
    type: Date,
    default: Date.now,
  },
};  

let cartStatics = {};

// Static method to create a new cart entity
cartStatics.newEntity = async (body) => {
    const model = {               
        items: body.items,
        userId: body.userId,
        totalAmount: body.totalAmount
    }
    return model;
};




module.exports = {
    statics: cartStatics,
    entity: cartEntity,
}
