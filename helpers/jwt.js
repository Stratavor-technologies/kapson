'use strict';
var jwt = require('jsonwebtoken');
var creds = require('../config/develop')
const auth = creds.auth

exports.getAccessToken = (user, session) => {
     var claims = {
          session: session.id,
          user: user.id,
     };
     return jwt.sign(claims, auth.secret, {
          expiresIn: `${auth.tokenPeriod}m` ,
     });
};

exports.getRefreshToken = (user) => {
     var claims = {
          user: user.id,
     };
     return jwt.sign(claims, auth.refreshSecret, {
          expiresIn: `${auth.refreshPeriod}d`
     });
};

exports.verifyToken = (token) => {
     return jwt.verify(token, auth.secret);
};
