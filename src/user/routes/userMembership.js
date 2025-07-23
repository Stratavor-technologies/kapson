const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const userMembershipValidation = require("../validators/userMembership");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validate]
  },

  {
    action: "POST",
    method: "create",
    url:"/create",
    filters: [auth.validateUser, validate(userMembershipValidation.createMembership)],
  },

  {
    action: "POST",
    method: "handleSession",
    url:"/handleSession",
    filters: [auth.validateUser]
  },

  {
    action: "POST",
    method: "cancelMembership",
    url:"/cancelMembership",
    filters: [auth.validate]
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(userMembershipValidation.updateUserMembership)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
   filters: [auth.validate],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(userMembershipValidation.removeMembership)],
  },
  
];

module.exports = { apiType: "userMemberships", routes };
