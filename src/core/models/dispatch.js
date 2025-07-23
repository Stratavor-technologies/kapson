const mongoose = require("mongoose");

const entity = {
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "invoice"
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    paymentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment"
    }, 
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
    },     
    dispatchedFrom: {
        type: String,
        default: "Kapson Tools",
    },

    customerName: {
        type: String,
        required: true,
    },
    orderId: {
       type: mongoose.Schema.Types.ObjectId,
           ref: 'order',
    },
    margin: {
        type: Number,
        default: 0,
    },
    grNo: String,
    transport: String,
    vehicleNo: String,
    ewayBillNo: String,
    adPercent: {
        type: Number,
        default: 0,
    },
    cdPercent: {
        type: Number,
    },
   
    privateMark: String,
    freightCharge: {
        type: Number,
    },
    courierCharge: {
        type: Number,
    },
    gstOnCourier: {
        type: Number,
    },
    grandTotal: {
        type: Number,
        default: 0,
    },
    dueDays:{
        type: Number
    },
    dueDate:{
        type: Date
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
};

let statics = {};

// Static method to create 
statics.newEntity = async (body) => {
    const model = {
        invoiceId: body.invoiceId,
        userId: body.userId,
        addressId: body.addressId,
        paymentId: body.paymentId,
        totalWeight: body.totalWeight,
        dueDays: body.dueDays,
        dueDate: body.dueDate,
        dispatchedFrom: body.dispatchedFrom || "Kapson Tools",
        customerName: body.customerName,
        orderId: body.orderId,
        margin: body.margin || 0,
        grNo: body.grNo,
        transport: body.transport,
        vehicleNo: body.vehicleNo,
        ewayBillNo: body.ewayBillNo,
        adPercent: body.adPercent || 0,
        cdPercent: body.cdPercent || 0,
        privateMark: body.privateMark,
        freightCharge: body.freightCharge || 0,
        courierCharge: body.courierCharge || 0,
        gstOnCourier: body.gstOnCourier || 0,
        grandTotal: body.grandTotal || 0,
        updatedAt: Date.now(),
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
