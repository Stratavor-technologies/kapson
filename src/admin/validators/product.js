const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createProduct = {
  body: Joi.object().keys({
    productName: Joi.string().required(),
    productImage: Joi.array().items(Joi.string()).optional(),
    ArtNumber: Joi.string().optional(),
    category: Joi.string().required().custom(objectId),
    subCategory: Joi.string().required().custom(objectId),
    stock: Joi.number().required(),
    hsnNumber: Joi.string().required().custom(objectId),
    mrp: Joi.number().required(),
    basicPrice: Joi.number().required(),
    productDescription: Joi.string().optional(),
    productFeature: Joi.array().items(Joi.string()).optional(),
    applicationDetails: Joi.array().items(Joi.string()).optional(),
    packagingDetails: Joi.object()
      .keys({
        piecesInPack: Joi.number().required(),
        piecesInBox: Joi.number().required(),
      })
      .optional(),
  }),
};

const updateProduct = {
  body: Joi.object().keys({
    productName: Joi.string().optional(),
    productImage: Joi.array().items(Joi.string()).optional(),
    stock: Joi.number().optional(),
    ArtNumber: Joi.string().optional(),
    category: Joi.string().optional().custom(objectId),
    subCategory: Joi.string().optional().custom(objectId),
    hsnNumber: Joi.string().optional().custom(objectId),
    mrp: Joi.number().optional(),
    basicPrice: Joi.number().optional(),
    productDescription: Joi.string().optional(),
    productFeature: Joi.array().items(Joi.string()).optional(),
    applicationDetails: Joi.array().items(Joi.string()).optional(),
    packagingDetails: Joi.object()
      .keys({
        piecesInPack: Joi.number().optional(),
        piecesInBox: Joi.number().optional(),
      })
      .optional(),
  }),
};

const searchProducts = {
  query: Joi.object().keys({
    search: Joi.string(),
    categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
        subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null).optional(),
        productName: Joi.string().optional(),
        sortBy: Joi.string().optional(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const getProductById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};

const removeProduct = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createProduct,
  updateProduct,
  searchProducts,
  getProductById,
  removeProduct,
};
