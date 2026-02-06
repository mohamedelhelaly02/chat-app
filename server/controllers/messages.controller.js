const asyncHandler = require('../utils/asyncHandler');
const { Message } = require('../models/message.model');
const { Chat } = require('../models/chat.model');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

const getAllMessages = asyncHandler(async (req, res, next) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(appError.create('Chat not found', 404, httpStatusText.FAIL));
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.userId.toString());
    if (!isParticipant) {
        return next(appError.create('Access forbidden', 403, httpStatusText.FORBIDDEN));
    }

    const messages = await Message.find({ chat: chatId, deleted: false })
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar')
        .sort({ createdAt: 1 });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { messages } });
});

const createTextMessage = asyncHandler(async (req, res, next) => {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return next(appError.create('Message content is required', 400, httpStatusText.FAIL));
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(appError.create('Chat not found', 404, httpStatusText.FAIL));
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.userId.toString());
    if (!isParticipant) {
        return next(appError.create('Access forbidden', 403, httpStatusText.FORBIDDEN));
    }

    const receiver = chat.participants.find(p => p.toString() !== req.userId.toString());

    const message = new Message({
        sender: req.userId,
        receiver: receiver,
        chat: chatId,
        messageType: 'text',
        content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    return res.status(201).json({ status: httpStatusText.SUCCESS, data: { message } });
});

const deleteMessage = asyncHandler(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
        return next(appError.create('Message not found', 404, httpStatusText.FAIL));
    }

    if (message.sender.toString() !== req.userId.toString()) {
        return next(appError.create('You can only delete your own messages', 403, httpStatusText.FORBIDDEN));
    }

    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    return res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Message deleted successfully' });
});

module.exports = { getAllMessages, createTextMessage, deleteMessage };
