const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const productValidation = require("../validators/product");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
   // filters: [auth.validate, validate(productValidation.getProductById)],
  },
  {
    action: "POST",
    method: "create",
    url: "/create",
    filters: [auth.validateAdmin, validate(productValidation.createProduct)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(productValidation.updateProduct)],
  },
  {
    action: "GET",
    method: "search",
    url: "",
   // filters: [auth.validate, validate(productValidation.searchProducts)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
     filters: [auth.validateAdmin, validate(productValidation.removeProduct)],
  },
];

module.exports = { apiType: "products", routes };
