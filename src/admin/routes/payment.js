const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const paymentValidation = require("../validators/payment");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validate, validate(paymentValidation.getPaymentById)],
  },
  {
    action: "POST",
    method: "create",
    url: "/create",
    filters: [auth.validateAdmin, validate(paymentValidation.createPayment)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
     filters: [auth.validateAdmin], //validate(paymentValidation.updatePayment)],
  },
  {
    action: "GET",
    method: "search",
    url: "",
    filters: [auth.validate],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(paymentValidation.removePayment)],
  },
  {
    action: "POST",
    method: "createOrderPayment",
    url: "/createCheckoutProductSession",
    filters: [auth.validateUser],
  },
  {
    action: "POST",
    method: "handlePayment",
    url: "/handlePayment",
    filters: [auth.validateUser],
  }
];

module.exports = { apiType: "payments", routes };
