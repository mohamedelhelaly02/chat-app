const asyncHandler = require("../utils/asyncHandler");
const { Message } = require("../models/message.model");
const { Chat } = require("../models/chat.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { User } = require("../models/user.model");

const getAllMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(appError.create("Chat not found", 404, httpStatusText.FAIL));
  }

  const isParticipant = chat.participants.some(
    (p) => p.toString() === req.userId.toString(),
  );
  if (!isParticipant) {
    return next(
      appError.create("Access forbidden", 403, httpStatusText.FORBIDDEN),
    );
  }

  const messages = await Message.find({ chat: chatId, deleted: false }).sort({
    createdAt: 1,
  });

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { messages } });
});

const createTextMessage = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = req.userId;

  if (!content?.trim()) {
    return next(
      appError.create("Message content is required", 400, httpStatusText.FAIL),
    );
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(appError.create("Chat not found", 404, httpStatusText.FAIL));
  }

  if (!chat.participants.includes(senderId)) {
    return next(
      appError.create("Access forbidden", 403, httpStatusText.FORBIDDEN),
    );
  }

  const receiverId = chat.participants.find(
    (p) => p.toString() !== senderId.toString(),
  );
  const receiver = await User.findById(receiverId);

  const message = new Message({
    sender: senderId,
    receiver: receiverId,
    chat: chatId,
    messageType: "text",
    content: content.trim(),
    delivered: !!receiver?.online,
    deliveredAt: receiver?.online ? new Date() : null,
  });

  await message.save();

  chat.lastMessage = message._id;
  if (receiverId) {
    const currentCount = chat.unreadCount.get(receiverId.toString()) || 0;
    chat.unreadCount.set(receiverId.toString(), currentCount + 1);
  }
  await chat.save();

  if (receiver?.online) {
    req.io.to(senderId.toString()).emit("user:message_delivered", {
      chatId: chatId,
      messageId: message._id,
    });

    req.io.to(receiverId.toString()).emit("user:new_message", message);
  }

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { message },
  });
});

const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(appError.create("Message not found", 404, httpStatusText.FAIL));
  }

  if (message.sender.toString() !== req.userId.toString()) {
    return next(
      appError.create(
        "You can only delete your own messages",
        403,
        httpStatusText.FORBIDDEN,
      ),
    );
  }

  message.deleted = true;
  message.deletedAt = new Date();
  await message.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Message deleted successfully",
  });
});

const sendVoiceMessage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      appError.create("Audio file is required", 400, httpStatusText.FAIL),
    );
  }

  const { receiverId, duration } = req.body;

  if (!receiverId) {
    return next(
      appError.create("Receiver user is required", 400, httpStatusText.FAIL),
    );
  }

  const chat = await Chat.getOrCreateChat(req.userId, receiverId);

  const voiceUrl = `/uploads/voice/${req.file.filename}`;

  const receiver = await User.findById(receiverId);

  const voiceMessage = new Message({
    sender: req.userId,
    receiver: receiverId,
    chat: chat._id,
    messageType: "voice",
    voiceUrl,
    voiceDuration: parseInt(duration) || 0,
    delivered: !!receiver?.online,
    deliveredAt: receiver?.online ? new Date() : null,
    read: false,
  });

  await voiceMessage.save();

  chat.lastMessage = voiceMessage._id;
  chat.updatedAt = new Date();

  const currentUnread = chat.unreadCount.get(receiverId.toString()) || 0;
  chat.unreadCount.set(receiverId.toString(), currentUnread + 1);

  await chat.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { voiceMessage },
  });
});

module.exports = {
  getAllMessages,
  createTextMessage,
  deleteMessage,
  sendVoiceMessage,
};
