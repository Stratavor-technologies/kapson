const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const userValidation = require("../validators/user");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validate],
  },
  {
    action: "POST",
    method: "create",
    url:'/create',
    filters: [auth.validate,validate(userValidation.createUser)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validate],
  },

  {
    action: "GET",
    method: "search",
    url:'',
   filters: [auth.validate], // validate(userValidation.search)]
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validate],
  },
  {
    action: "GET",
    method: "updateNotificationCount",
    url: "/update/count/:id",
    filters: [auth.validate], // validate(userValidation.get)]
  },
];

module.exports = { apiType: "users", routes };
