const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const offerValidation = require("../validators/offer");

const routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(offerValidation.getofferById)],
  },
  {
    action: "POST",
    method: "create",
    url: "/create",
    //filters: [auth.validateAdmin, validate(offerValidation.createoffer)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(offerValidation.updateoffer)],
  },
  {
    action: "GET",
    method: "search",
    url: "/",
    //filters: [auth.validateAdmin, validate(offerValidation.searchoffers)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(offerValidation.removeoffer)],
  }
];

module.exports = { apiType: "offers", routes };
