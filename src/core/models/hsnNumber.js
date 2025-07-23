const { number, required } = require("joi");
const mongoose = require("mongoose");


const entity = {
    hsnNumber:{
        type:Number,
        required:true,
        unique: true
    },
    gstPercentage: {
        type: Number,
        required: true,
    min: 0,
        max: 100
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }

};
let statics = {};

// Static method to create 
statics.newEntity = async (body) => {

    const model = {
        hsnNumber: body.hsnNumber,
        gstPercentage: body.gstPercentage
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
