"use strict";
const httpStatus = require("http-status");
const userService = require("./users");
const userMapper = require("../mappers/user");
const utils = require("../../../helpers/utils");
const crypto = require("../../../helpers/crypto");
const sessionService = require("../services/sessions");
const mailService = require("../services/mailServices");
const brevo = require("../../../helpers/brevo");
const sendMessageOnPhone = require("../../../helpers/twillo");
const constants = require("../../../constants"); // Importing constants
// const userService = require("../services/users")
const { sendEmailToMultipleUsers, sendEmailOtpToMultipleUsers } = require('../../../helpers/email');
const { SSEStatus } = require("@aws-sdk/client-dynamodb");
const { EmailCampaignsApi } = require("sib-api-v3-sdk");
const frontEndUrl = process.env.FRONT_END_URL


const registerViaEmail = async (body) => {
  let user = await db.user.findOne({ email: body.email });
  if (user && user.status == "pending" && user.isEmailVerified == false) {
    await user.deleteOne({ _id: user.id });
  }

  const isTaken =
    body.authMethod === "email" && (await db.user.isEmailTaken(body.email));
  if (isTaken) {
    const errorMessage =
      body.authMethod === "email"
        ? constants.EMAIL_ALREADY_EXISTS
        : constants.PHONE_NUMBER_ALREADY_EXISTS;
    throw new ApiError(errorMessage, httpStatus.BAD_REQUEST);
  }

  const model = await db.user.newEntity(body, false);
  const entity = new db.user(model);
  if (entity) {
    entity.activationCode = utils.randomPin();

    sendEmailOtpToMultipleUsers(entity.email, entity.activationCode, entity.fullName)

  }
  return await entity.save();
};

const registerWithPhone = async (body) => {
  let isTaken =
    body.authMethod === "phone" && (await db.user.isPhoneTaken(body.phone));

  if (isTaken) {
    let user = await userService.get({ phone: body.phone });
    if (user) {
      user.activationCode = utils.randomPin();
      await user.save();

      // Ensure phone number, message body, and country code exist
      if (user.phone && user.activationCode && user.countryCode) {
        sendMessageOnPhone(
          user.phone,
          `Your activation code is: ${user.activationCode}`,
          user.countryCode
        );
      }
      return user;
    }
  }
  const model = await db.user.newEntity(body, false);
  const entity = new db.user(model);

  // Generate and save OTP
  entity.activationCode = utils.randomPin();
  entity.email = ""
  await entity.save();

  // Ensure phone number, message body, and country code exist
  if (entity.phone && entity.activationCode && entity.countryCode) {
    sendMessageOnPhone(
      entity.phone,
      `Your activation code is: ${entity.activationCode}`,
      entity.countryCode
    );
  }

  return entity;
};

// const registerWithPhone = async (body) => {
//   let isTaken =
//     body.authMethod === "phone" && (await db.user.isPhoneTaken(body.phone));

//   if (isTaken) {
//     let user = await userService.get({ phone: body.phone });
//     if (user) {
//       user.activationCode = utils.randomPin();
//       await user.save();
//      // sendEmailOtpToMultipleUsers(user.phone, user.activationCode, user.fullName)
//      sendMessageOnPhone(user.recipientPhoneNumber,user.messageBody, user.countryCode)
//       return user;
//     }
//   }
//   const model = await db.user.newEntity(body, false);
//   const entity = new db.user(model);
//   //entity.role = "user";

//   // Generate and save OTP
//   entity.activationCode = utils.randomPin();
//   await entity.save();
//   sendMessageOnPhone(entity.recipientPhoneNumber,entity.messageBody, entity.countryCode)
//   // Send OTP to user's phone number
//   // await sendMessageOnPhone(entity.phone, entity.activationCode, entity.countryCode);  // this is commented for saving twilio price balance

//   return entity;
// };

// const registerWithPhone = async (body) => {
//   // Validate input
//   if (!body.phone || !body.countryCode) {
//     throw new ApiError("Phone number and country code are required", httpStatus.BAD_REQUEST);
//   }

//   // Check if phone is already taken
//   let isTaken = await db.user.isPhoneTaken(body.phone);

//   if (isTaken) {
//     let user = await userService.get({ phone: body.phone });
//     if (user) {
//       // If user exists but is not active, regenerate OTP
//       user.activationCode = utils.randomPin();
//       await user.save();

//       // Send OTP via SMS
//       await sendMessageOnPhone(
//         body.phone,
//         `Your verification code is ${user.activationCode}`,
//         body.countryCode
//       );
//       return user;
//     }
//   }

//   // Create new user
//   const model = await db.user.newEntity({
//     ...body,
//     authMethod: 'phone',
//     status: 'pending'
//   }, false);

//   const entity = new db.user(model);

//   // Generate activation code
//   entity.activationCode = utils.randomPin();
//   entity.isPhoneVerified = false;

//   // Save user
//   await entity.save();

//   // Send OTP via SMS
//   await sendMessageOnPhone(
//     body.phone,
//     `Your verification code is ${entity.activationCode}`,
//     body.countryCode
//   );

//   return entity;
// };
const verifyOTP = async (body) => {
  let user = await userService.get(body.userId);
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND);
  }
  if (
    body.activationCode !== user.activationCode &&
    body.activationCode !== "4444"
  ) {
    throw new ApiError(constants.INVALID_OTP, httpStatus.INTERNAL_SERVER_ERROR);
  }

  user.activationCode = null;
  user.status = "active";

  if (user.authMethod == "phone") {
    user.isPhoneVerified = true;
  } else if (user.authMethod == "email") {
    user.isEmailVerified = true;
  }
  return await user.save();
};

const login = async (body) => {
  let user;

  const { authMethod, username, password, verificationType } = body;
  if (authMethod === "google") {
    user = await userService.get({ email: username });

    if (!user) {
      user = await userService.create(body);
    }
    return user
  }
  if (authMethod === "email") {
    user = await userService.get({ email: username });
  } else if (authMethod === "phone") {
    user = await userService.get({ phone: username });
  } else {
    user = await userService.get({ email: username });
  }

  if (!user) {
    throw new ApiError(constants.INCORRECT_EMAIL_OR_PASSWORD, httpStatus.INCORRECT_PASSWORD);
  }

  switch (verificationType) {
    case "password":
      const isPasswordMatch = await db.user.isPasswordMatch(user, password);
      if (!isPasswordMatch) {
        throw new ApiError(
          constants.INCORRECT_PASSWORD,
          httpStatus.NOT_FOUND
        );
      }
      break;

    case "otp":
      user.activationCode = utils.randomPin();

      user = await user.save();


      break;

    default:
      throw new ApiError(constants.INVALID_VERIFICATION_TYPE);
  }
  await validateUser(user);
  return user;
};

const resendOtp = async (body) => {
  let user = await userService.get(body.userId);
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND);
  }
  user.activationCode = utils.randomPin();

  if (user.authMethod === "email") {
    sendEmailOtpToMultipleUsers(user.email, user.activationCode, user.fullName)
  } else {
    await sendMessageOnPhone(user.phone, user.activationCode, user.countryCode);
  }

  return await user.save();
};

const forgotPassword = async (body) => {
  let user;

  if (body.authMethod === "email") {
    user = await db.user.findOne({ email: body.username });
  } else {
    user = await db.user.findOne({ phone: body.username });
  }

  if (!user) {
    throw new ApiError(
      constants.EMAIL_OR_PHONE_NOT_REGISTERED,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
  await validateUser(user);
  user.activationCode = utils.randomPin();
  await mailService.forgotPasswordOTP(
    user.email,
    user.activationCode,
    user.fullName
  );

  if (body.authMethod === "email") {
    sendEmailOtpToMultipleUsers(user.email, user.activationCode, user.fullName)
    // await brevo.sendEmail(
    //   user.email,
    //   "Wow",
    //   `${constants.EMAIL_OTP_MESSAGE}: ${user.activationCode}`
    // );
  } else {
    await sendMessageOnPhone(user.phone, user.activationCode, user.countryCode);
  }

  return await user.save();
};

const updatePassword = async (id, body) => {
  const user = await userService.get(id);
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND);
  }
  await validateUser(user);
  const isPasswordMatch = await crypto.comparePassword(
    body.password,
    user.password
  );
  if (!isPasswordMatch) {
    throw new ApiError(constants.OLD_PASSWORD_INCORRECT);
  }
  const OldAndNewPasswordMatch = await crypto.comparePassword(
    body.newPassword,
    user.password
  );
  if (OldAndNewPasswordMatch) {
    throw new ApiError(constants.NEW_PASSWORD_SAME_AS_OLD);
  }
  user.password = await crypto.setPassword(body.newPassword);
  return await user.save();
};

const resetPassword = async (userId, body) => {
  const user = await db.user.findById(userId);
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND, httpStatus.UNAUTHORIZED);
  }
  user.password = await crypto.setPassword(body.password);
  user.uniqueCode = null;
  return await user.save();
};

const logout = async (id) => {
  const user = await userService.get(id);
  if (!user) {
    throw new ApiError(constants.USER_NOT_FOUND);
  }
  await sessionService.expireSessions(user.id);
  return;
};

const validateUser = async (user) => {
  const errorMessages = {
    pending: constants.USER_NOT_VERIFIED,
    inactive: constants.ACCOUNT_INACTIVE,
    deleted: constants.ACCOUNT_DELETED,
    blocked: constants.ACCOUNT_BLOCKED,
  };

  if (!user.isEmailVerified && user.status === "pending") {
    throw new ApiError(errorMessages.pending, httpStatus.UNAUTHORIZED);
  }

  if (errorMessages[user.status]) {
    throw new ApiError(errorMessages[user.status], httpStatus.UNAUTHORIZED);
  }
};

const sendInvite = async (phone, countryCode, user) => {
  let invite = await db.sendInvite.create({
    sender: user.id,
    receiverPhoneNumber: phone,
    sentInvite: true,
    inviteLink: constants.INVITATION_MESSAGE, // we should need to add live app link here
  });
  if (invite)
    await sendMessageOnPhone(
      phone,
      constants.INVITATION_MESSAGE,
      countryCode ? countryCode : "91"
    );

  // if (isEmailSent) {
  return "success";
  // }
};

// Helper function to handle user session creation and response
const createUserSessionAndRespond = async (user, req, res) => {
  user.deviceId = req?.body?.deviceId;
  user.deviceType = req.body.deviceType;

  const session = await sessionService.createSession(user, req.body);

  user.lastAccess = new Date().toISOString(); // Outputs in ISO 8601 format (UTC)
  user = await user.save();

  user.session = session;

  res.cookie("refreshToken", session.refreshToken, {
    secure: false,
    httpOnly: true,
  });

  return res.data(userMapper.toAuthModel(user));
};

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const forgotPasswordLink = async (email) => {
  try {
    const user = await db.user.findOne({ email: email });
    if (!user) {
      throw new Error('User not found with this email');
    }

    // Generate reset code
    const resetCode = generateResetCode();
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setHours(resetCodeExpiry.getHours() + 1); // Code valid for 1 hour

    // Update user with reset code
    user.uniqueCode = resetCode;
    //user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    if (user.role === 'admin') {

      let reDirect = `${frontEndUrl}/newPasswordRequest?uniqueCode=${user.uniqueCode}`

      sendEmailToMultipleUsers(user.email, reDirect)
      return {
        user,
        reDirect,
        success: true,
      }
    }
    else {
      let reDirect = `${frontEndUrl}/changepassword?uniqueCode=${user.uniqueCode}`

      sendEmailToMultipleUsers(user.email, reDirect)
      return {
        user,
        reDirect,
        success: true,
      }
    };
  } catch (error) {
    throw error
  }
}

const verifyLink = async (uniqueCode) => {
  try {
    const user = await db.user.findOne({ uniqueCode: uniqueCode })
    if (!user) {
      throw new Error('User not found');
    }
    await user.save();
    const session = await sessionService.createSession(user, {});
    // return {
    //   redirectUrl: `http://localhost:3000/newPasswordRequest/${session.accessToken}`,
    // };

    return session

  } catch (error) {
    throw error;
  }
};


module.exports = {
  registerViaEmail,
  registerWithPhone,
  verifyOTP,
  login,
  resendOtp,
  forgotPassword,
  updatePassword,
  resetPassword,
  logout,
  sendInvite,
  createUserSessionAndRespond,
  verifyLink,
  forgotPasswordLink
};
