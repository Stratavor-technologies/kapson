const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const companyValidation = require("../validators/company");

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
    filters: [auth.validateAdmin, validate(companyValidation.createCompany)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(companyValidation.updateCompany)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
    filters: [validate(companyValidation.searchCompanies)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/delete/:id",
    filters: [auth.validateAdmin, validate(companyValidation.deleteCompany)],
  },

];

module.exports = { apiType: "companies", routes };
