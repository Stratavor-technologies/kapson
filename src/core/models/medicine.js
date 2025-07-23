const { number } = require("joi");
const mongoose = require("mongoose");


const entity = {
  medicineName: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subCategory',
  },
  stock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
image: {
    type: [String],
    //default: "https://bsmedia.business-standard.com/_media/bs/img/article/2023-07/12/full/1689175810-294.jpg?im=FitAndFill=(826,465)",
  },
  expireDate: {
    type: Date,
    default: '',
  },
  manufacturerDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'DISABLE', 'OUT_OF_STOCK'],
    default: 'AVAILABLE',
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
  },
  medicineDetails: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    ref: "rating"
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

// Static method to create a new category entity
statics.newEntity = async (body) => {
  console.log('Received body:', body);
  console.log('CreatedBy value:', body.createdBy);

  if (!body.createdBy) {
    throw new Error('createdBy is required and must be a valid user ID');
  }

  if (!mongoose.Types.ObjectId.isValid(body.createdBy)) {
    throw new Error('Invalid createdBy ID format');
  }

  const model = {
    medicineName: body.medicineName,
    category: body.category,
    subCategory: body.subCategory,
    stock: body.stock,
    price: body.price,
    image: body.image,
    expireDate: body.expireDate,
    manufacturerDate: body.manufacturerDate,
    company: body.company,
    status: body.status || 'ACTIVE',
    medicineDetails: body.medicineDetails || '',
    rating: body.rating,
    createdBy: body.createdBy
  };

  return model;
};

module.exports = {
  statics,
  entity,
};
