const express = require('express');
const router = express.Router();
const { getOrCreateChat, getAllChats } = require('../controllers/chat.controller');
const { getAllMessages } = require('../controllers/messages.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { getOrCreateChatValidator } = require('../validators/chatValidationSchema');
const { validateMiddleware } = require('../middlewares/validateMiddleware');

router.route('')
    .post(
        authMiddleware,
        getOrCreateChatValidator(),
        validateMiddleware,
        getOrCreateChat
    )
    .get(
        authMiddleware,
        getAllChats
    );

router.get('/:chatId/messages',
    authMiddleware,
    getAllMessages
);

module.exports = { chatRouter: router };