const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");

let routes = [
  {
    action: "POST",
    method: "handleNotifications",
    url: "/notification",
  },
];

module.exports = { apiType: "pubSubs", routes };
