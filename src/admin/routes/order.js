const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const orderValidation = require("../validators/order");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validate, validate(orderValidation.getOrderById)],
  },
  
  {
    action: "POST",
    method: "placeOrder", 
    url:"/placeOrder/:id",
    filters: [auth.validate],
  },

  {
    action: "POST",
    method: "proceedToCheckout",
    url:"/proceedToCheckout/:id",
   // filters:[auth.validate],
  },
  {
    action: "POST",
    method: "shopNow",
    url:"/shopNow",
    filters: [auth.validate],
  },
  
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validate],
  },
  {
    action: "GET",
  method: "search",
    url:"",
    filters: [auth.validate, validate(orderValidation.searchOrder)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/delete/:id",
    filters: [auth.validate,validate(orderValidation.removeOrder)],
  },
  
];

module.exports = { apiType: "orders", routes };
