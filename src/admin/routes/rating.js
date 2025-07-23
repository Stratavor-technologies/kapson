const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const ratingValidation = require("../validators/rating");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
   filters: [auth.validate, validate(ratingValidation.getRatingById)],
  },
  {
    action: "POST",
    method: "create",
    url:"",
    filters: [auth.validate, validate(ratingValidation.createRating)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validate, validate(ratingValidation.updateRating)],
  },
  {
    action: "GET",
    method: "search",
    url:"",
   // filters: [auth.validate, validate(ratingValidation.searchRating)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validate,validate(ratingValidation.removeRating)],
  },
  
];

module.exports = { apiType: "ratings", routes };
