const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const bannerValidation = require("../validators/banner");

let routes = [
  {
    action: "GET",
    method: "get",
    url:"/:id",
    // filters: [validate(bannerValidation.getBannerById)],
  },
  {
    action: "POST",
    method: "create",
    url:"/create",
    filters: [auth.validateAdmin, validate(bannerValidation.createBanner)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(bannerValidation.updateBanner)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
    // filters: [validate(bannerValidation.searchBanner)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin,validate(bannerValidation.removeBanner)],
  },
  
];

module.exports = { apiType: "banners", routes };
