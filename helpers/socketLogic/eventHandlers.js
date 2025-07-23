const mongoose = require("mongoose");
const { handleRegister, handlePrivateMessage, handleTyping, handleGetChatsList } = require("./socketUtils");

const handleConnection = (socket, io, users) => {
  console.log("A user connected");

  socket.on("register", async (username, receiver) => {
    await handleRegister(socket, username, receiver, users);
  });

  socket.on("privateMessage", async (data) => {
    await handlePrivateMessage(socket, io, users, data);
  });

  socket.on("typing", ({ to, from }) => {
    handleTyping(socket, io, users, to, from, "typing");
  });

  socket.on("stopTyping", ({ to, from }) => {
    handleTyping(socket, io, users, to, from, "stopTyping");
  });

  socket.on("getChatsList", async (receiverId) => {
    await handleGetChatsList(socket, receiverId);
  });

  socket.on("disconnect", () => {
    let disconnectedUsername = Object.keys(users).find(
      (key) => users[key] === socket.id
    );
    if (disconnectedUsername) {
      console.log(`User ${disconnectedUsername} disconnected`);
      delete users[disconnectedUsername];
    }
  });
};

module.exports = {
  handleConnection,
};
