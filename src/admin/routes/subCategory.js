const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const subcategoryValidation = require("../validators/subcategory");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(subcategoryValidation.getSubcategoryById)],
  },
  {
    action: "POST",
    method: "create",
    url:"/create",
    //filters: [auth.validateAdmin, validate(subcategoryValidation.createSubcategory)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(subcategoryValidation.updateSubcategory)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
   // filters: [auth.validateAdmin, validate(subcategoryValidation.searchSubcategories)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
   // filters: [auth.validateAdmin, validate(subcategoryValidation.removeSubcategory)],
  },
];


module.exports = { apiType: "subCategories", routes };
