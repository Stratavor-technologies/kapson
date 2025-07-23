const { number, required } = require("joi");
const mongoose = require("mongoose");


const entity = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    validTill: {
        type: String
    },
    notificationHeading: {
        type:String
    },
    notification: {
            type:String
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
        userId: body.userId,
        validTill: body.validTill,
        notificationHeading: body.notificationHeading,
        notification: body.notification
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
