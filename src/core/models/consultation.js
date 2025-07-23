const mongoose = require("mongoose");

const consultationEntity = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the patient/user
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the doctor
    required: true,
  },
  consultationDate: {
    type: Date,
    required: true,
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription", // Reference to the prescription if generated
    required: false,
  },
  notes: {
    type: String,
    required: false, // Optional field for any doctor’s notes
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
};

let consultationStatics = {};

consultationStatics.newEntity = async (body) => {
  const model = {
    userId: body.userId,
    doctorId: body.doctorId,
    consultationDate: body.consultationDate,
    status: body.status || "scheduled",
  };

  return model;
};

module.exports = {
  entity: consultationEntity,
  statics: consultationStatics,
};
