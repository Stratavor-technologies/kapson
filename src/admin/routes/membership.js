const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const membershipValidation = require("../validators/membership");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validateAdmin, validate(membershipValidation.getMembershipById)],
  },

  {
    action: "POST",
    method: "create",
    url:"/create",
    filters: [auth.validateAdmin, validate(membershipValidation.createMembership)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateAdmin, validate(membershipValidation.updateMembership)],
  },
  {
    action: "GET",
    method: "search",
    url:"/",
   filters: [auth.validate, validate(membershipValidation.searchMembership)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateAdmin, validate(membershipValidation.removeMembership)],
  },
  {
    action: "POST",
    method: "createCheckoutSession",
    url: "/create-checkout-session",
    filters: [auth.validateAdmin],
  },
  {
    action: "POST",
    method: "webhook",
    url: "/webhook",
    filters: [auth.validateAdmin],
  },
 
 {
    action: "POST",
    method: "handleSuccess",
    url: "/success",
    filters: [auth.validateAdmin],
  },
  
];

module.exports = { apiType: "memberships", routes };
