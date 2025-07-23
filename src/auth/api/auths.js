"use strict";
const authService = require("../services/auths");
const sessionService = require("../services/sessions");
const mapper = require("../mappers/user");
const httpStatus = require("http-status");
const moment = require("moment");
const countries = require("../../auth/resources/countries.json");
const countriesPin = require ("../../auth/resources/countriesPin.json");
const state = require ("../../auth/resources/states.json");
const constants = require("../../../constants");
const { sendEmailToMultipleUsers } = require('../../../helpers/email');

exports.registerViaEmailOrPhone = async (req, res) => {
  let user;
  if (req.body.authMethod === "email") {
    user = await authService.registerViaEmail(req.body);
  } else {
    user = await authService.registerWithPhone(req.body);
  }
  return res.data(mapper.toModel(user))
  
  // return authService.createUserSessionAndRespond(user, req, res);
};

exports.registerViaPhone = async (req, res) => {
  let user = await authService.registerWithPhone(req.body);
  return res.data(mapper.toModel(user), httpStatus.CREATED);
};

exports.verifyOTP = async (req, res) => {
  let user = await authService.verifyOTP(req.body);
  return authService.createUserSessionAndRespond(user, req, res);
};

exports.login = async (req, res) => {
  let user = await authService.login(req.body);
  return authService.createUserSessionAndRespond(user, req, res);
};

exports.forgotPassword = async (req, res) => {
  let user = await authService.forgotPassword(req.body);
  return res.data(mapper.toModel(user), httpStatus.CREATED);
};

exports.updatePassword = async (req, res) => {
  await authService.updatePassword(req.params.id, req.body);
  return res.success(constants.NEW_PASSWORD_UPDATED);
};

exports.resetPassword = async (req, res) => {
  await authService.resetPassword(req.query.userId, req.body);
  return res.success(constants.PASSWORD_RESET);
};

exports.resendOtp = async (req, res) => {
  await authService.resendOtp(req.body);
  return res.success(constants.OTP_RESENT_SUCCESSFULLY);
};

exports.logout = async (req, res) => {
  await authService.logout(req.params.id);
  return res.success(constants.USER_LOGOUT_SUCCESS);
};

exports.sendInvite = async (req, res) => {
  await authService.sendInvite(req.body.phone, req.body.countryCode, req.user);
  return res.success(constants.INVITE_SENT_SUCCESSFULLY);
};

exports.countriesList = async (req, res) => {
  return res.data(countries);
};
exports.countriesPin = async (req, res) => {
  return res.data(countriesPin);
};
exports.states = async (req, res) => {
  return res.data(state);
};

exports.forgotPasswordLink = async (req, res) => {
  const result = await authService.forgotPasswordLink(req.body.username);
  return res.data(result);
};

exports.verifyLink = async (req, res) => {
  const result = await authService.verifyLink(req.query.uniqueCode);
  return res.data(result);
};

exports.getStatesByCountry = async (req, res) => {
  try {
    const { countryCode } = req.query; // Using country code for precise matching

    if (!countryCode) {
      return res.status(400).json({ 
        error: 'Country code is required' 
      });
    }

    // Find the country with the matching country code
    const country = countries.find(
      country => country.code2 === countryCode || country.code3 === countryCode
    );

    if (!country) {
      return res.status(404).json({ 
        error: 'Country not found',
        message: `No country found with code: ${countryCode}`
      });
    }

    // Check if the country has states
    if (!country.states || country.states.length === 0) {
      return res.status(404).json({ 
        error: 'No states found',
        message: `No states available for country: ${country.name}`
      });
    }

    // Return states with minimal information
    const states = country.states.map(state => ({
      code: state.code,
      name: state.name,
      subdivision: state.subdivision || null
    }));

    res.status(200).json({
      message: 'States retrieved successfully',
      data: {
        countryName: country.name,
        countryCode: country.code2,
        states: states
      }
    });
  } catch (error) {
    console.error('Error retrieving states:', error);
    res.status(500).json({ 
      error: 'Internal server error while retrieving states',
      details: error.message
    });
  }
};

exports.getCitiesByState = async (req, res) => {
  const { state: stateName } = req.query;

  if (!stateName) {
    return res.status(400).json({ error: "State parameter is required" });
  }

  const cities = state[stateName];
  
  if (!cities) {
    return res.status(404).json({ error: "State not found" });
  }

  return res.json(cities);
};