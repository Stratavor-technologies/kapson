const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createMedicine = {
  body: Joi.object().keys({
    medicineName: Joi.string().required(),
    category: Joi.string().required(),
    subCategory: Joi.string().required(),
    stock: Joi.number().required(),
    price: Joi.number().required(),
    image: Joi.array().items(Joi.string().uri()).required(),
    expireDate: Joi.date().allow(''),
    manufacturerDate: Joi.date().required(),
    status: Joi.string().valid('AVAILABLE', 'DISABLE', 'OUT_OF_STOCK').default('AVAILABLE'),
    company: Joi.string().required(),
    medicineDetails: Joi.string().allow(''),
    //rating: Joi.string().required()
  }),
};


const updateMedicine = {
  body: Joi.object().keys({
    medicineName: Joi.string().optional(),
    category: Joi.string().optional(),
    subCategory: Joi.string().optional(),
    stock: Joi.number().optional(),
    price: Joi.number().optional(),
    image: Joi.array().items(Joi.string()).optional(),
    expireDate: Joi.date().allow('').optional(),
    manufacturerDate: Joi.date().optional(),
    status: Joi.string().valid('AVAILABLE', 'DISABLE', 'OUT_OF_STOCK').optional(),
    company: Joi.string().optional(),
    medicineDetails: Joi.string().allow('').optional(),
  }),
};

const searchMedicine = {
  query: Joi.object().keys({
    search: Joi.string(),
    medicineId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null).optional(),
    company: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    priceRangeId: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    ...pageSchema, // Assuming pageSchema includes pagination parameters
  }),
};


const getMedicineById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};

const removeMedicine = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};



module.exports = {
  createMedicine,
  updateMedicine,
  searchMedicine,
  getMedicineById,
  removeMedicine,
};
