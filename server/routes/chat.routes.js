const express = require("express");
const router = express.Router();
const {
  getOrCreateChat,
  getAllChats,
  getChatById,
} = require("../controllers/chat.controller");
const {
  getAllMessages,
  createTextMessage,
  deleteMessage,
} = require("../controllers/messages.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getOrCreateChatValidator,
} = require("../validators/chatValidationSchema");
const { validateMiddleware } = require("../middlewares/validateMiddleware");

router
  .route("")
  .post(
    authMiddleware,
    getOrCreateChatValidator(),
    validateMiddleware,
    getOrCreateChat,
  )
  .get(authMiddleware, getAllChats);

router.get("/:chatId", authMiddleware, getChatById);

router.get("/:chatId/messages", authMiddleware, getAllMessages);

router.post("/:chatId/messages", authMiddleware, createTextMessage);

router.delete("/messages/:messageId", authMiddleware, deleteMessage);

module.exports = { chatRouter: router };

module.exports = { chatRouter: router };
