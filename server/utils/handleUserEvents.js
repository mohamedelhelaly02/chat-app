const { User } = require("../models/user.model");
const { Chat } = require("../models/chat.model");
const { Message } = require("../models/message.model");

const handleUserEvents = (io, socket) => {
  socket.on("user:login", async ({ userId }) => {
    const user = await User.findById(userId);

    if (!user) {
      console.error(`User with id: ${userId} not found`);
      return;
    }

    socket.broadcast.emit("user:online", {
      userId,
      online: true,
      username: user.username,
    });

    try {
      const undeliveredMessages = await Message.find({
        receiver: userId,
        delivered: false,
      });

      if (undeliveredMessages.length > 0) {
        const messageIds = undeliveredMessages.map((m) => m._id.toString());

        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { delivered: true, deliveredAt: new Date() } },
        );

        undeliveredMessages.forEach((msg) => {
          io.to(msg.sender.toString()).emit("user:message_delivered", {
            chatId: msg.chat.toString(),
            messageId: msg._id.toString(),
          });
        });

        console.log(
          `Updated ${undeliveredMessages.length} messages to delivered for user ${userId}`,
        );
      }
    } catch (error) {
      console.error("Error processing offline messages:", error);
    }
  });

  socket.on("user:logout", async ({ userId }) => {
    console.log(`User with socket id: ${socket.id} logged out`);
    console.log(`User with id: ${userId} logged out`);

    const updatedUser = await User.findByIdAndUpdate(userId, {
      online: false,
      lastSeen: new Date(),
    });

    socket.broadcast.emit("user:statusChanged", {
      userId,
      online: false,
      username: updatedUser.username,
    });
  });

  socket.on("user:typing", async ({ toUserId, fromUserId, isTyping }) => {
    if (!toUserId || !fromUserId) {
      console.warn("Invalid typing payload");
      return;
    }

    console.log(
      `User ${fromUserId} is ${isTyping ? "typing..." : "stopped typing"} to ${toUserId}`,
    );
    const user = await User.findById(toUserId);

    if (!user) {
      console.error(`User with id: ${toUserId} not found`);
      return;
    }

    io.to(toUserId).emit("user:typing", { userId: fromUserId, isTyping });
  });

  socket.on("user:new_message", async ({ toUserId, fromUserId, message }) => {
    try {
      if (!message) return;

      const updatedChat = await Chat.findOne({ _id: message.chat })
        .populate("participants", "username email avatar online lastSeen")
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "username avatar",
          },
        });

      const chatForReceiver = updatedChat.toObject();
      chatForReceiver.participants = chatForReceiver.participants.filter(
        (p) => p._id.toString() !== toUserId.toString(),
      );
      chatForReceiver.unreadCount =
        updatedChat.unreadCount.get(toUserId.toString()) || 0;

      const chatForSender = updatedChat.toObject();
      chatForSender.participants = chatForSender.participants.filter(
        (p) => p._id.toString() !== fromUserId.toString(),
      );
      chatForSender.unreadCount =
        updatedChat.unreadCount.get(fromUserId.toString()) || 0;

      io.to(toUserId).emit("chat:updated", { chat: chatForReceiver });
      io.to(fromUserId).emit("chat:updated", { chat: chatForSender });
    } catch (error) {
      console.error("Error emitting new message:", error);
    }
  });

  socket.on("user:chat_opened", async ({ chatWithUserId, userId }) => {
    try {
      const existedChat = await Chat.getOrCreateChat(userId, chatWithUserId);
      const result = await Message.updateMany(
        { chat: existedChat._id, receiver: userId, read: false },
        { read: true, readAt: new Date() },
      );

      existedChat.unreadCount.set(userId, 0);
      await existedChat.save();

      if (result.modifiedCount > 0) {
        const readMessages = await Message.find({
          chat: existedChat._id,
          receiver: userId,
          read: true,
        });

        io.to(chatWithUserId).emit("user:messages_read", {
          readBy: userId,
          readIds: readMessages.map((message) => message._id.toString()),
          chatId: existedChat._id,
          chatWithUserId: chatWithUserId,
        });
      }
    } catch (error) {
      console.error("chat_opened error:", error);
    }
  });

  socket.on("user:seen_messages", async ({ chatWithUserId, readBy }) => {
    const user = await User.findById(readBy);

    if (!user) return;

    io.to(chatWithUserId).emit("user:read_messsages_success", {
      message: `${user.username} read your messages`,
    });
  });
};

module.exports = { handleUserEvents };
