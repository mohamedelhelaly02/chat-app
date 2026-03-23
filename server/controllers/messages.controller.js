const asyncHandler = require("../utils/asyncHandler");
const { Message } = require("../models/message.model");
const { Chat } = require("../models/chat.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { User } = require("../models/user.model");
const { allowedEmojis } = require("../utils/constants");

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

  const messages = await Message.find({ chat: chatId })
    .populate({
      path: "reactions",
      select: "-__v",
      populate: {
        path: "reactedBy",
        select: "username avatar",
      },
    })
    .sort({ createdAt: 1 });

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

    // req.io.to(receiverId.toString()).emit("user:new_message", message);
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

  const lastMessage = await Message.findOne({
    chat: message.chat,
    deleted: { $ne: true },
  }).sort({ createdAt: -1 });

  const updatedChat = await Chat.findByIdAndUpdate(
    message.chat,
    {
      lastMessage: lastMessage?._id || null,
      updatedAt: Date.now(),
    },
    { new: true },
  );

  req.io
    .to(message.receiver.toString())
    .emit("user:chat_updated_after_delete", {
      chatId: updatedChat._id,
      lastMessage,
    });

  req.io.to(req.userId).emit("user:chat_updated_after_delete", {
    chatId: updatedChat._id,
    lastMessage,
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { messageId: message._id },
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

  if (receiver?.online) {
    req.io.to(req.userId).emit("user:message_delivered", {
      chatId: chat._id,
      messageId: voiceMessage._id,
    });

    req.io.to(receiverId).emit("user:new_message", { message: voiceMessage });
  }

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { message: voiceMessage },
  });
});

const reactToMessage = asyncHandler(async (req, res, next) => {
  const { chatId, messageId } = req.params;

  const { emoji } = req.body;

  const existedChat = await Chat.findById(chatId);

  if (!existedChat) {
    return next(
      appError.create(
        "Start conversation to react to message",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  const isParticipant = existedChat.participants.some(
    (p) => p.toString() === req.userId,
  );

  if (!isParticipant) {
    return next(
      appError.create(
        "can not to react to message",
        403,
        httpStatusText.FORBIDDEN,
      ),
    );
  }

  let existedMessage = await Message.findById(messageId).where({
    deleted: false,
  });

  if (!existedMessage) {
    return next(appError.create("Message not found", 404, httpStatusText.FAIL));
  }

  if (!emoji || !allowedEmojis.includes(emoji)) {
    return next(
      appError.create("Not allowed emoji", 400, httpStatusText.ERROR),
    );
  }

  const updatedMessage = await existedMessage.addReaction(req.userId, emoji);

  // req.io.to(req.userId).emit("messageReactionUpdated", {
  //   messageId: messageId,
  //   response,
  // });

  req.io
    .to(updatedMessage.sender.toString())
    .emit("messageReactionUpdated", { message: updatedMessage });

  req.io
    .to(updatedMessage.receiver.toString())
    .emit("messageReactionUpdated", { message: updatedMessage });

  return res.status(200).json({
    status: "success",
    data: updatedMessage,
  });
});

const getMessageReactions = asyncHandler(async (req, res, next) => {
  const { chatId, messageId } = req.params;

  const existedChat = await Chat.findById(chatId);

  if (!existedChat) {
    return next(appError.create("Chat not found", 404, httpStatusText.FAIL));
  }

  const isParticipant = existedChat.participants.some(
    (p) => p.toString() === req.userId,
  );

  if (!isParticipant) {
    return next(
      appError.create(
        "You are not authorized to view reactions in this chat",
        403,
        httpStatusText.FORBIDDEN,
      ),
    );
  }

  const message = await Message.findOne({
    _id: messageId,
    chat: chatId,
    deleted: false,
  })
    .populate({
      path: "reactions",
      select: "-__v",
      populate: {
        path: "reactedBy",
        select: "username avatar",
      },
    })
    .select("-__v");

  if (!message) {
    return next(
      appError.create("Message not found or deleted", 404, httpStatusText.FAIL),
    );
  }

  const reactionsSummary = message.reactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  return res.status(200).json({
    status: "success",
    data: {
      totalReactions: message.reactions.length,
      summary: reactionsSummary,
      allReactions: message.reactions,
    },
  });
});

module.exports = {
  getAllMessages,
  createTextMessage,
  deleteMessage,
  sendVoiceMessage,
  reactToMessage,
  getMessageReactions,
};
