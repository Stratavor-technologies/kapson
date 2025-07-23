const mongoose = require("mongoose");

const prescriptionEntity = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the user who uploaded the prescription
    required: true,
  },
  fileUrl: { 
    type: String, 
    required: true,  // Path or URL to the stored file
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v); // Simple URL validation for ensuring it's a URL
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: Date, // Optional field to store verification date
};

let prescriptionStatics = {};

// Method for creating a new prescription entity
prescriptionStatics.newEntity = async (body) => {
  const model = {
    userId: body.userId,
    fileUrl: body.fileUrl,
    status: body.status || "pending",
  };

  return model;
};

module.exports = {
  entity: prescriptionEntity,
  statics: prescriptionStatics,
};
