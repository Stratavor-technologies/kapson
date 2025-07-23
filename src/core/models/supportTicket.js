const mongoose = require("mongoose");

const supportTicketEntity = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the user who raised the issue
    required: true,
  },
  supportStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the support staff handling the ticket
    required: false, // Initially, there may be no staff assigned
  },
  issue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

let supportTicketStatics = {};

supportTicketStatics.newEntity = async (body) => {
  const model = {
    userId: body.userId,
    issue: body.issue,
    status: body.status || "open",
  };

  return model;
};

module.exports = {
  entity: supportTicketEntity,
  statics: supportTicketStatics,
};
