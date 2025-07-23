const messageService = require("../../src/intalked/services/messages");
const mongoose = require("mongoose");

const handleRegister = async (socket, username, receiver, users) => {  
  users[username] = socket.id;
  console.log(`User ${username} registered with socket ID ${socket.id}`);
  try {
    if (username || receiver) {
      const recentMessages = await messageService.search({
        sender: username,
        receiver: receiver ? receiver : "66cc0b37351eebee9715c88a",
      });
      socket.emit("recentMessages", recentMessages.items);
    }
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
  }
};

const handlePrivateMessage = async (socket, io, users, { to, message, from }) => {
  const recipientSocketId = users[to];
  let messageCreated = await messageService.create({ message, sender: from, receiver: to });

  if (recipientSocketId) {
    io.to(recipientSocketId).emit("privateMessage", { message, from });


    if (to || from) {
      const recentMessages = await messageService.search({
        sender: to,
        receiver: from ? from : "66cc0b37351eebee9715c88a",
      });
      socket.emit("recentMessages", recentMessages.items);
    }



    const ifChatExist = await db.chat.findOne({
      sender: new mongoose.Types.ObjectId(from),
      receiver: new mongoose.Types.ObjectId(to),
    });

    if (!ifChatExist) {
      await db.chat.create({
        participants: [new mongoose.Types.ObjectId(to), new mongoose.Types.ObjectId(from)],
        sender: new mongoose.Types.ObjectId(from),
        receiver: new mongoose.Types.ObjectId(to),
        lastMessage: messageCreated.id,
        unreadMessagesCount: 0,
        lastUpdated: new Date(),
      });
    }

    console.log(`Message from ${from} to ${to}: ${message}`);
  } else {
    console.log(`User ${to} not found`);
  }
};

const handleTyping = (socket, io, users, to, from, eventType) => {
  const recipientSocketId = users[to];
  if (recipientSocketId) {
    io.to(recipientSocketId).emit(eventType, from);
  }
};

const handleGetChatsList = async (socket, receiverId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      socket.emit("chatListError", "Invalid receiver ID");
      return;
    }

    const chatList = await db.chat.findOne({ receiver: receiverId }).populate("lastMessage");

    const recentMessage = await db.message
      .findOne({ $or: [{ sender: chatList.receiver }, { receiver: chatList.sender }] })
      .sort({ createdAt: -1 })
      .populate("sender receiver")
      .exec();

    const unreadMessages = await db.message
      .find({ receiver: chatList.sender, isRead: false })
      .sort({ createdAt: -1 })
      .populate("sender receiver")
      .exec();

    chatList.lastMessage = recentMessage;
    chatList.unreadMessagesCount = unreadMessages.length;
    await chatList.save();

    socket.emit("chatsList", chatList);
  } catch (error) {
    console.error("Error fetching chat list:", error);
    socket.emit("chatListError", "Failed to fetch chat list");
  }
};

module.exports = {
  handleRegister,
  handlePrivateMessage,
  handleTyping,
  handleGetChatsList,
};
