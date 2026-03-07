const { User } = require("../models/user.model");
const { Message } = require("../models/message.model");

const handleConnection = async (io, socket) => {
  console.log(`User connected: ${socket.user.id}`);

  const userId = socket.user.id;

  socket.join(userId);

  const user = await User.findById(userId);

  await User.findByIdAndUpdate(userId, { online: true });

  socket.broadcast.emit("user:statusChanged", {
    userId: userId,
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

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);

    await User.findByIdAndUpdate(userId, {
      online: false,
      lastSeen: new Date(),
    });

    socket.broadcast.emit("user:statusChanged", {
      userId: userId,
      online: false,
      username: user.username,
    });
  });
};

module.exports = { handleConnection };
