"use strict";
const creds = require("../../../config/develop");
const fcmConfig = creds.fcm;

const FCM = require("fcm-node");

const fcm = new FCM(fcmConfig.serverKey);

exports.sendIOSPush = function (fcmToken, message, cb) {
  var message = {
    to: fcmToken,
    data: {
      title: message.title || "",
      body: message.description || "",
      imgUrl: message.imgUrl,
      entityId: message.entityId,
      entityName: message.entityName,
      dataId: message.dataId,
      dataName: message.dataName,
      appName: "Recapp",
    },
    notification: {
      title: message.title,
      body: message.description,
      sound: "default",
    },
    content_available: true,
    mutable_content: true,
    priority: "high",
    sound: "default",
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("sendIosPush fail");
      console.log(err);
      if (cb) {
        return cb(err);
      }
    } else {
      console.log("sendIosPush done");
      if (cb) {
        return cb(null);
      }
    }
  });
};

exports.sendAndroidPush = function (fcmToken, message, cb) {
  var message = {
    to: fcmToken,
    data: {
      title: message.title || "",
      body: message.description || "",
      imgUrl: message.imgUrl,
      entityId: message.entityId,
      entityName: message.entityName,
      dataId: message.dataId,
      dataName: message.dataName,
      appName: "Recapp",
    },
    notification: {
      title: message.title,
      body: message.description,
    },
    sound: "default",
    priority: "high",
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("sendAndroidPush fail");
      console.log(err);
      if (cb) {
        return cb(err);
      }
    } else {
      console.log("sendAndroidPush done");
      if (cb) {
        return cb(null);
      }
    }
  });
};

exports.sendWebPush = function (fcmToken, message, cb) {
  var message = {
    to: fcmToken,
    data: {
      title: message.title || "",
      body: message.description || "",
      imgUrl: message.imgUrl,
      entityId: message.entityId,
      entityName: message.entityName,
      dataId: message.dataId,
      dataName: message.dataName,
      appName: "Recapp",
    },
    notification: {
      title: message.title,
      body: message.description,
    },
    sound: "default",
    priority: "high",
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("sendAndroidPush fail");
      console.log(err);
      if (cb) {
        return cb(err);
      }
    } else {
      console.log("sendAndroidPush done");
      if (cb) {
        return cb(null);
      }
    }
  });
};

exports.sendMulticast = function (fcmTokens, message, cb) {
  var message = {
    registration_ids: fcmTokens,
    data: {
      title: "Recapp",
      content: message.text,
      imgUrl: message.imgUrl,
    },
  };
  fcm.send(message, function (err, response) {
    if (err) {
      if (cb) {
        return cb(err);
      }
    } else {
      if (cb) {
        return cb(null);
      }
    }
  });
};
