require("dotenv").config();

module.exports = {
  env: process.env.ENV,
  mongodb: {
    database: process.env.MONGODB_DATABASE,
    host: process.env.MONGODB_HOST,
  },
  webServer: {
    baseUrl: process.env.WEB_SERVER_BASE_URL,
    port: process.env.WEB_SERVER_PORT,
  },
  auth: {
    sessionType: process.env.AUTH_SESSION_TYPE,
    secret: process.env.AUTH_SECRET,
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
    tokenPeriod: parseInt(process.env.AUTH_TOKEN_PERIOD, "100d"),
    refreshPeriod: parseInt(process.env.AUTH_REFRESH_PERIOD, "100d"),
  },
  aws: {
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: process.env.AWS_BUCKET,
    folder: process.env.AWS_FOLDER,
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
    url: process.env.FCM_URL,
  },
  sendGrid: {
    key: process.env.SENDGRID_KEY,
  },
  logger: {
    console: {
      level: process.env.LOGGER_CONSOLE_LEVEL,
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS === "true",
      json: process.env.LOGGER_JSON === "true",
      colorize: process.env.LOGGER_COLORIZE === "true",
    },
  },
  brevo: {
    key: process.env.BREVO_KEY,
  },
  Crypto: {
    key: process.env.CRYPTO_KEY,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhone: process.env.TWILIO_FROM_PHONE,
  },
  salts: {
    keyBufferSalt: parseInt(process.env.KEY_BUFFER_SALT, 10),
    IV_LENGTH: parseInt(process.env.IV_LENGTH, 10),
    genSalt: parseInt(process.env.GEN_SALT, 10),
  },
  smtp: {
    email: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD,
  },
};


