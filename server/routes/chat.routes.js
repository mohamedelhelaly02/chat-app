const express = require("express");
const router = express.Router();
const {
  getOrCreateChat,
  getAllChats,
  getChatById,
  markMessagesRead,
} = require("../controllers/chat.controller");
const {
  getAllMessages,
  createTextMessage,
  deleteMessage,
  sendVoiceMessage,
  reactToMessage,
  getMessageReactions,
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

const upload = require("../middlewares/multerConfig");

router.get("/:chatId", authMiddleware, getChatById);

router.post("/:chatId/messages/read", authMiddleware, markMessagesRead);

router.get("/:chatId/messages", authMiddleware, getAllMessages);

router.post("/:chatId/messages", authMiddleware, createTextMessage);
router.post(
  "/:chatId/messages/:messageId/reactions",
  authMiddleware,
  reactToMessage,
);
router.get(
  "/:chatId/messages/:messageId/reactions",
  authMiddleware,
  getMessageReactions,
);

router.post(
  "/messages/voice",
  authMiddleware,
  upload.single("voice"),
  sendVoiceMessage,
);

router.delete("/messages/:messageId", authMiddleware, deleteMessage);

module.exports = { chatRouter: router };

module.exports = { chatRouter: router };
