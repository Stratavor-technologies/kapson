const entity = {
    unlockDate: Date,
};

let statics = {};

statics.newEntity = async (body) => {
    const model = {
       unlockDate: body.unlockDate
    };
    return model;
};

module.exports = {
    entity,
    statics
};
