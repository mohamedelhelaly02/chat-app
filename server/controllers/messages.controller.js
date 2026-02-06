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

module.exports = { getAllMessages };
