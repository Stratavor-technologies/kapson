"use strict";
const apiRoutes = require("../../../middlewares/apiRoutes");
const path = require("path");

const prescriptionRoute = require("../routes/prescription");
const userMembershipRoute = require("../routes/userMembership");


module.exports.configure = (app, endpoints) => {
  app
    .get("/api/onboarding", (req, res) => {
      return res.send(endpoints.listAllEndpoints(app));
    })
    .descriptor({
      name: "Retrieve APIs documentation",
    });

  const root = path.normalize(__dirname + "./../");
  let api = apiRoutes(root, app);


  api.model(prescriptionRoute.apiType).register(prescriptionRoute.routes);
  api.model(userMembershipRoute.apiType).register(userMembershipRoute.routes);
};
