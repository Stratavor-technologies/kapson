const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // Declare a variable for Socket.IO instance

const { auth } = require("../config/develop");

// Function to initialize Socket.IO
const initializeIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Make sure the client domain is allowed
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  //START

  // Middleware to authenticate socket connections using JWT
  io.use((socket, next) => {
    try {
      // Validate if `auth` is present in the handshake
      if (!socket.handshake.auth || typeof socket.handshake.auth !== "object") {
        console.error(
          "Authentication data is missing or malformed in the handshake."
        );
        return next(new Error("Authentication data is required"));
      }

      const token = socket.handshake.auth.token;

      // Check if token is provided
      if (!token) {
        console.error("Authentication token is missing in the handshake.");
        return next(new Error("Authentication token is required"));
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, auth.secret);

      // Attach the decoded user data to the socket for later use
      socket.user = decoded;

      console.log("Socket authenticated successfully:", decoded);
      next();
    } catch (error) {
      // Catch and log any errors during the process
      console.error("Socket authentication failed:", error.message);
      return next(new Error("Invalid token"));
    }
  });

  /// END

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id, "User:", socket.user);

    // Example: Listening for a custom event from the client
    socket.on("message", (data) => {
      console.log("Message received from user:", socket.user, data);

      // Broadcast message to all connected clients
      io.emit("message", { user: socket.user, message: data });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized with JWT authentication.");
};

// Function to get the Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO is not initialized. Please call initializeIO first."
    );
  }
  return io;
};

module.exports = { initializeIO, getIO };
