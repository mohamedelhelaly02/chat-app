const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/user.model');
const { Chat } = require('../models/chat.model');

const getOrCreateChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ status: 'fail', message: 'UserId is required' });
    }

    if (userId === req.userId) {
        return res.status(400).json({ status: 'fail', message: 'Can not create chat with yourself' });
    }

    // check if the user exists that i make chat with it
    const chatWithUser = await User.findById(userId);

    if (!chatWithUser) {
        return res.status(400).json({ status: 'fail', message: 'Select a user to chat with it' })
    }

    const chat = await Chat.getOrCreateChat(req.userId, userId);

    return res.status(200).json({ status: 'success', data: { chat } });
});

const getAllChats = asyncHandler(async (req, res, next) => {

});

module.exports = { getOrCreateChat, getAllChats };