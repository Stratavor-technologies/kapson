"use strict";
const base = require("../../../api/api-base")(__dirname, "users", "user");
const userService = require("../services/users");
const userMapper = require("../mappers/user");
const httpStatus = require("http-status");
const constants = require("../../../constants");

exports.create = async (req, res) => {
  let retVal = await userService.create(req.body,req.user);
  return res.data(retVal);
};

exports.update = async (req, res) => {
  let retVal = await userService.update(req.params.id,req.body,req.user);
  return res.data(retVal);
};

exports.search = async (req, res) => {
  let retVal = await base.search(req);
  return res.page(retVal);
};

exports.get = async (req, res) => {
  let retVal = await base.get(req);
  return res.data(retVal);
};

exports.delete = async (req, res) => {
  let retVal = await base.delete(req);
  return res.success(retVal);
};

exports.updateUsername = async (req, res) => {
  const { username } = req.body;

  let isUsernameExist = await userService.get({ username });
  if (isUsernameExist) {
    throw new ApiError(constants.USERNAME_ALREADY_EXISTS);
  }

  let userEntity = await userService.get(req.userId);
  if (!userEntity.canUpdateUsername) {
    throw new ApiError(constants.USERNAME_UPDATE_LIMIT, httpStatus.BAD_REQUEST);
  }

  userEntity.username = username;
  userEntity = await userEntity.save();

  return res.data(userMapper.toModel(userEntity));
};

exports.updateNotificationCount = async (req, res) => {
  const entity = await userService.updateNotificationCount(req.params.id);
  return res.data(userMapper.toModel(entity));
};

exports.getUsersByPhone = async (req, res) => {
  const entity = await userService.getUsersByPhone(req);
  return res.data(entity);
};
exports.getAll = async (req, res) => {
  const entity = await userService.getAllUsers();
  return res.data(entity);
};
