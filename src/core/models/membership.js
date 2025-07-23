const { number } = require("joi");
const mongoose = require("mongoose");


const entity = {
    membershipName: {
        type: String,
        required: true,
    },
    membershipDescription: {
        type: [String],
        required: true,
    },
    membershipDuration: {
        type: String,
        enum: ['Monthly', 'Yearly'],
        required: true,
    },
    stripePriceId:{
        type:String,
    },
    price: {
        type: Number,
        required: true,
    },
    status:{
        type: String,
        enum:["active", "inActive"],
        default:"active"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

};
let statics = {};

// Static method to create 
statics.newEntity = async (body) => {

    const model = {
        membershipName: body.membershipName,
        membershipDescription: body.membershipDescription,
        membershipDuration: body.membershipDuration,
        price: body.price,
        createdBy: body.createdBy,
        stripePriceId: body.stripePriceId,
        status: body.status
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
