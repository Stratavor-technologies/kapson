const { number, required } = require("joi");
const mongoose = require("mongoose");

const entity = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    offerStartsOn: {
        type: String
    },
    offerEndsOn: {
        type:String
    },
    offerHeading: {
            type:String
    },
    offerDetails: {
      type: String  
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
        offerStartsOn: body.offerStartsOn,
        offerEndsOn: body.offerEndsOn,
        offerHeading: body.offerHeading,
        offerDetails: body.offerDetails
    };

    return model;
};

module.exports = {
    statics,
    entity,
};
