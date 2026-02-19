const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/user.model');
const { Chat } = require('../models/chat.model');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

const getOrCreateChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.body;
    const chatWithUser = await User.findById(userId);

    if (!chatWithUser) {
        return next(appError.create('Chat participant not found', 400, httpStatusText.FAIL));
    }

    const chat = await Chat.getOrCreateChat(req.userId, userId);
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { chat } });
});

const getAllChats = asyncHandler(async (req, res, next) => {
    const chats = await Chat.find({
        participants: req.userId
    })
        .populate('participants', 'username email avatar online lastSeen')
        .populate({
            path: 'lastMessage',
            populate: {
                path: 'sender',
                select: 'username avatar'
            }
        })
        .sort({ updatedAt: -1 });

    const chatsWithUnread = chats.map(chat => {
        const chatObj = chat.toObject();

        chatObj.participants = chatObj.participants.filter(p => p._id.toString() !== req.userId.toString());

        chatObj.unreadCount = chat.unreadCount.get(req.userId.toString()) || 0;
        return chatObj;
    });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { chats: chatsWithUnread } });
});

module.exports = { getOrCreateChat, getAllChats };