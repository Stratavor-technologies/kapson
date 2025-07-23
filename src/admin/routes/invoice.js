const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const invoiceValidation = require("../validators/invoice");

let routes = [
  {
    action: "GET",
    method: "get",
    url:"/:id",
   filters: [auth.validate, validate(invoiceValidation.getInvoiceById)],
  },

  {
    action: "POST",
    method: "create",
    url:"/create",
    filters: [auth.validateAdmin, validate(invoiceValidation.createInvoice)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(invoiceValidation.updateInvoice)],
  },
  {
    action: "GET",
    method: "search",
    url:"",
   filters: [auth.validate, validate(invoiceValidation.searchInvoice)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(invoiceValidation.removeInvoice)],
  },
  
];

module.exports = { apiType: "invoices", routes };
