"use strict";
const httpStatus = require("http-status");
const jwtHelper = require("../helpers/jwt");
const sessionService = require("../src/auth/services/sessions");
const _ = require("underscore");
const constants = require("../constants");
const tokenValidator = async (token) => {
  try {
    return jwtHelper.verifyToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError("Token Expired", httpStatus.UNAUTHORIZED);
    }
    throw new ApiError(err);
  }
};

const sessionValidator = async (sessionId) => {
  let session = await sessionService.get(sessionId);
  if (!session) {
    throw new ApiError(constants.SESSION_NOT_FOUND, httpStatus.UNAUTHORIZED);
  }
  if (session.status === "expired") {
    throw new ApiError(constants.SESSION_EXPIRED, httpStatus.UNAUTHORIZED);
  }
  return session;
};

const userValidator = async (userId) => {
  let user = await db.user.findById(userId); // can include role in future
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND, httpStatus.UNAUTHORIZED);
  }
  if (user.status == "inactive") {
    throw new ApiError(USER_IS_INACTIVE, httpStatus.UNAUTHORIZED);
  }
  if (user.status == "deleted") {
    throw new ApiError(USER_IS_DELETED, httpStatus.UNAUTHORIZED);
  }
  if (user.status == "blocked") {
    throw new ApiError(USER_IS_BLOCKED, httpStatus.UNAUTHORIZED);
  }
  return user;
};


exports.validate = async (req, res, next) => {
  try {
    var token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) return res.accessDenied();

    let claims = await tokenValidator(token);
    req.sessionId = claims.session;
    req.userId = claims.user;

    let session = await sessionValidator(req.sessionId);
    req.session = session;

    let user = await userValidator(req.userId);
    req.user = user;

   

    next();
  } catch (err) {
    next(err);
  }
};

exports.validateTokenOptional = (req, res, next) => {
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) return this.validate(req, res, next);

  req.sessionId = null;
  req.userId = null;
  req.session = null;
  req.user = null;
  next();
};

exports.validateRefreshToken = (req, res, next) => {
  var refreshToken = req.cookies.refreshToken || req.headers["refreshToken"];

  if (!refreshToken) {
    return res.status(403).send({
      success: false,
      message: constants.REFRESH_TOKEN_REQUIRED,
    });
  }

  let claims = jwtHelper.verifyToken(token);
  req.user = claims;
  next();
};


exports.validateDealer = async (req, res, next) => {
  try {
    // Fetch token from body, query, or headers
    var token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) return res.accessDenied();

    // Validate the token and extract claims
    let claims = await tokenValidator(token);
    req.sessionId = claims.session;
    req.userId = claims.user;

    // Validate the session and user
    let session = await sessionValidator(req.sessionId);
    req.session = session;

    let user = await userValidator(req.userId);
    req.user = user;

    // Check if the user's role is 
    if (req.user.role !== 'Dealer') {
      return res.status(403).json({ message: 'Unauthorized: Access restricted to dealer only.' });
    }

    // TODO: Permission validation pending

    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    next(err); // Pass any errors to the next middleware for error handling
  }
};

exports.validateDistributer = async (req, res, next) => {
  try {
    // Fetch token from body, query, or headers
    var token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) return res.accessDenied();

    // Validate the token and extract claims
    let claims = await tokenValidator(token);
    req.sessionId = claims.session;
    req.userId = claims.user;

    // Validate the session and user
    let session = await sessionValidator(req.sessionId);
    req.session = session;

    let user = await userValidator(req.userId);
    req.user = user;

    // Check if the user's role is 
    if (req.user.role !== 'Distributer') {
      return res.status(403).json({ message: 'Unauthorized: Access restricted to distributer only.' });
    }

    // TODO: Permission validation pending

    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    next(err); // Pass any errors to the next middleware for error handling
  }
};

exports.validateUser = async (req, res, next) => {
  try {
    // Fetch token from body, query, or headers
    var token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) return res.accessDenied();

    // Validate the token and extract claims
    let claims = await tokenValidator(token);
    req.sessionId = claims.session;
    req.userId = claims.user;

    // Validate the session and user
    let session = await sessionValidator(req.sessionId);
    req.session = session;

    let user = await userValidator(req.userId);
    req.user = user;

    // Check if the user's role is 'seller'
    if (req.user.role !== 'USER') {
      return res.status(403).json({ message: 'Unauthorized: Access restricted to users only.' });
    }

    // TODO: Permission validation pending

    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    next(err); // Pass any errors to the next middleware for error handling
  }
};

exports.validateAdmin = async (req, res, next) => {
  try {
    // Fetch token from body, query, or headers
    var token = req.body.token || req.query.token || req.headers["x-access-token"];
    console.log("token       ",token)
    if (!token) return res.accessDenied();

    // Validate the token and extract claims
    let claims = await tokenValidator(token);
    req.sessionId = claims.session;
    req.userId = claims.user;

    // Validate the session and user
    let session = await sessionValidator(req.sessionId);
    req.session = session;

    let user = await userValidator(req.userId);
    req.user = user;

    // Check if the user's role is 'seller'
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized: Access restricted to Admin only.' });
    }

    // TODO: Permission validation pending

      next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    next(err); // Pass any errors to the next middleware for error handling
  }
};