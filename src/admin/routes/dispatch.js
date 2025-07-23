const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const dispatchValidation = require("../validators/dispatch");

let routes = [
  {
    action: "GET",
    method: "get",
    url:"/:id",
   filters: [auth.validate, validate(dispatchValidation.getDispatchById)],
  },

  {
    action: "POST",
    method: "create",
    url:"/create",
    filters: [auth.validate, validate(dispatchValidation.createDispatch)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(dispatchValidation.updateDispatch)],
  },
  {
    action: "GET",
    method: "search",
    url:"",
   filters: [auth.validate, validate(dispatchValidation.searchDispatches)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(dispatchValidation.removeDispatch)],
  },
  
];

module.exports = { apiType: "dispatches", routes };
