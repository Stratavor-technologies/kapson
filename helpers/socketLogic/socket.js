const { Server } = require("socket.io");
const { handleConnection } = require("./eventHandlers");

let io;
let users = {};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => handleConnection(socket, io, users));

  console.log("Socket.IO server is running");
};

const stopSocketServer = () => {
  if (io) {
    io.close(() => {
      console.log("Socket.IO server has stopped");
    });
  }
};

const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

module.exports = {
  initializeSocket,
  stopSocketServer,
  getSocketInstance,
};
