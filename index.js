require("dotenv").config();
require('events').EventEmitter.defaultMaxListeners = 15; // Increase max listeners limit

const { app } = require("./app");
const logger = require("./helpers/logger")();
const webServer = require("./config/develop").webServer;

global.ApiError = require("./helpers/ApiError");

try {
  require("./helpers/string");
  require("./settings/database").configure();
} catch (err) {
  console.log(err);
}

const http = require("http");
const server = http.createServer(app);


server.listen(webServer.port, () => {
  logger.debug(`Listening to port ${webServer.port}`);
  console.log(`Listening to port ${webServer.port}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  console.error("Uncaught Exception:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
