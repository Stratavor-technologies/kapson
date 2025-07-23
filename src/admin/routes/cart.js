const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const cartValidation = require("../validators/cart");

let routes = [
  {
    action: "GET",
    method: "get",
    url:"/:id",
    filters: [validate(cartValidation)],
  },
  
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [validate(cartValidation)],
  },
  {
    action: "GET",
    method: "search",
    url: "/",
    filters: [auth.validate]
  },
  {
    action: "Get",
    method: "getCartByToken",
    url: "/getCart/ByToken",
    filters: [auth.validate],
  },
  {
    action: "POST",
    method: "addToCart",
    url: "/addToCart",
   filters: [auth.validate, validate(cartValidation.createCart)],
  },

  {
    action: "DELETE",
    method: "removeFromCart",
    url: "/delete/:id",
    filters: [auth.validate, validate(cartValidation.removeCart)],
  },
  {
    action: "DELETE",
    method: "removeItems",
    url: "/web/:id",
    filters: [auth.validate, validate(cartValidation.removeCart)],
  },

];

module.exports = { apiType: "carts", routes };
