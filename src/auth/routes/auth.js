const validate = require("../../../middlewares/validate");
const authValidation = require("../validators/auth");
const auth = require("../../../middlewares/auth");
   
let routes = [
  {
    action: "POST",
    method: "registerViaEmailOrPhone",
    url: "/signup",
    filters: [validate(authValidation.registerViaEmailOrPhone)],
  },
 
  {
    action: "POST",
    method: "verifyOTP",
    url: "/verifyOTP",
    filters: [validate(authValidation.verifyOTP)],
  },
  {
    action: "POST",
    method: "login",
    url: "/login",
    filters: [validate(authValidation.login)],
  },
  {
    action: "POST",
    method: "resendOtp",
    url: "/resendOtp",
    filters: [validate(authValidation.resendOtp)],
  },

  {
    action: "PUT",
    method: "logout",
    url: "/logout/:id",  },

  {
    action: "POST",
    method: "forgotPassword",
    url: "/forgotPassword",
   // filters: [validate(authValidation.forgotPassword)],
  },
  {
    action: "PUT",
    method: "updatePassword",
    url: "/updatePassword/:id",
    filters: [validate(authValidation.updatePassword)],
  },
  {
    action: "PUT",
    method: "resetPassword",
    url: "/resetPassword",
    filters: [validate(authValidation.resetPassword)],
  },

  {
    action: "POST",
    method: "sendInvite",
    url: "/sendInvite",
    filters: [auth.validate],
  },

  {
    action: "GET",
    method: "countriesList",
    url: "/countries/List",
  },
  {
    action: "GET",
    method: "states",
    url: "/state/List",
  },
  {
    action: "GET",
    method: "countriesPin",
    url: "/countries/Pin",
  },
  {
    action: "GET",
    method: "getCitiesByState",
    url: "/city",
  },
  {
    action: "GET",
    method: "getStatesByCountry",
    url: "/states",
  },

  {
    action:"GET",
    method:"verifyLink",
    url:"/verify/Link"
  },
  {
    action:"POST",
    method:"forgotPasswordLink",
    url:"/forgot/link"
  }
];

module.exports = { apiType: "auths", routes };
