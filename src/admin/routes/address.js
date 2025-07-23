const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const addressValidation = require("../validators/address");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validate, validate(addressValidation.getAddressById)],
  },

  {
    action: "POST",
    method: "create",
    url: "/create",
    filters: [auth.validate, validate(addressValidation.createAddress)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validate, validate(addressValidation.updateAddress)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
    filters: [auth.validate, validate(addressValidation.searchAddress)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validate,validate(addressValidation.removeAddress)],
  },
  
];

module.exports = { apiType: "addresses", routes };
