const { User } = require("../models/user.model");
const { Message } = require("../models/message.model");
const { addUser, removeUser } = require("../utils/presence");

const handleConnection = async (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.user.id;

  addUser(userId, socket.id);
  socket.join(userId);

  socket.broadcast.emit("user:statusChanged", {
    userId: userId,
    online: true,
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

      const senders = [
        ...new Set(undeliveredMessages.map((m) => m.sender.toString())),
      ];


      // todo
      senders.forEach((senderId) => {
        io.to(senderId).emit("user:message_delivered", {
          receiverId: userId,
          messageIds: undeliveredMessages
            .filter((m) => m.sender.toString() === senderId)
            .map((m) => m._id),
        });
      });

      console.log(
        `Updated ${undeliveredMessages.length} messages to delivered for user ${userId}`,
      );
    }
  } catch (error) {
    console.error("Error processing offline messages:", error);
  }

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    setTimeout(async () => {
      const activeSockets = await io.in(userId).fetchSockets();
      if (activeSockets.length === 0) {
        removeUser(userId);
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        socket.broadcast.emit("user:statusChanged", {
          userId: userId,
          online: false,
        });
      }
    }, 3000);
  });
};

module.exports = { handleConnection };
