const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const hsnNumberValidation = require("../validators/hsnNumber");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
  },
  {
    action: "POST",
    method: "create",
    url:"/create",
   filters: [auth.validateAdmin, validate(hsnNumberValidation.createHsnNumber)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
   filters: [auth.validateAdmin, validate(hsnNumberValidation.updateHsnNumber)],
  },
  {
    action: "GET",
    method: "search",
    url:"/"
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(hsnNumberValidation.removeHsnNumber)],
  },

];

module.exports = { apiType: "hsnNumbers", routes };
