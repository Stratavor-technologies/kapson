const mongoose = require("mongoose");


const invoiceEntity = {
    invoiceId:{
        type:String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
      //  required: true,
        ref: "user"
    },
   
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'order'
    },
    paymentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'payment'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
};  

let invoiceStatics = {};

// Static method to create a new invoice entity
invoiceStatics.newEntity = async (body) => {
    const model = {
        invoiceId:body.invoiceId,
        userId: body.userId,
        orderId: body.orderId,
        paymentId: body.paymentId,
        createdAt: new Date()
    };
    return model;
};

module.exports = {
    statics: invoiceStatics,
    entity: invoiceEntity,
}
