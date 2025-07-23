const jwt = require("../../../helpers/jwt");

var creds = require('../../../config/develop')
const authConfig = creds.auth
const moment = require("moment");
let sessionType = authConfig.sessionType || "single";

const createSession = async (user, body) => {
  let model = {
    user: user.id,
    fcmToken: body.deviceId || user.deviceId,
    deviceType: body.deviceType|| "web",
  };
  await expireSessions(user.id);

  let entity = new db.session(model);
  entity.accessToken = jwt.getAccessToken(user, entity);
  entity.refreshToken = jwt.getRefreshToken(user);

  // entity.accessTokenExpires = moment().add(authConfig.tokenPeriod, "minutes");
  entity.accessTokenExpires = moment().add(authConfig.tokenPeriod, "days");
  entity.refreshTokenExpires = moment().add(authConfig.refreshPeriod, "days");
  return await entity.save();
};

const expireSessions = async (userId) => {
  await db.session.updateMany({ user: userId }, { status: "expired" });
};

const get = async (id) => {
  return await db.session.findById(id);
};
module.exports = {
  createSession,
  expireSessions,
  get,
};
