"use strict";
const apiRoutes = require("../../../middlewares/apiRoutes");
const path = require("path");

// const roomRoute = require("../routes/room");


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


  // api.model(roomRoute.apiType).register(roomRoute.routes);

};
