const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const medicineValidation = require("../validators/medicine");

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
    filters: [auth.validateAdmin, validate(medicineValidation.createMedicine)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(medicineValidation.updateMedicine)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/delete/:id",
    filters: [auth.validateAdmin, validate(medicineValidation.removeMedicine)],
  },
  
];

module.exports = { apiType: "medicines", routes };
