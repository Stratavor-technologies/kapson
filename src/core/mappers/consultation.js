"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    userId: entity.userId,            // Reference to the patient/user
    doctorId: entity.doctorId,        // Reference to the doctor
    consultationDate: entity.consultationDate,
    prescriptionId: entity.prescriptionId, // Reference to the prescription if generated
    notes: entity.notes,              // Optional field for doctor's notes
    status: entity.status,            // Status of the consultation
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
