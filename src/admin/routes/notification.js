const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const notificationValidation = require("../validators/notification");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(notificationValidation.getnotificationById)],
  },
  {
    action: "POST",
    method: "create",
    url:"/create",
    //filters: [auth.validateAdmin, validate(notificationValidation.createnotification)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    //filters: [auth.validateAdmin, validate(notificationValidation.updatenotification)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
   // filters: [auth.validateAdmin, validate(notificationValidation.searchSubcategories)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
   // filters: [auth.validateAdmin, validate(notificationValidation.removenotification)],
  },
];


module.exports = { apiType: "notifications", routes };
