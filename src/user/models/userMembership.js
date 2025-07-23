const { number } = require("joi");
const mongoose = require("mongoose");
const invoice = require("../../core/models/invoice");


const entity = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    invoiceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'invoice'
    },
    membershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'membership',
    },
    stripeMembershipId:{
        type:String 
    },
    membershipFrom: {
        type: String,
        required: true

    },
    membershipTo: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "pending", "canceled"],
        default: "pending"
    },
    isPaymentDone: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    stripePriceId: {
        type: String,
    }


};
let statics = {};

// Static method to create a new category entity
statics.newEntity = async (body) => {

    const model = {
        invoiceId:body.invoiceId,
        userId: body.userId,
        membershipId: body.membershipId,
        membershipFrom: body.membershipFrom,
        membershipTo: body.membershipTo,
        isPaymentDone:body.isPaymentDone,
        price: body.price,
        createdAt: body.createdAt,
        updatedAt: body.updatedAt,
        stripeMembershipId: body.stripeMembershipId
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
