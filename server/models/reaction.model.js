const mongoose = require("mongoose");
const { allowedEmojis } = require("../utils/constants");

const reactionSchema = new mongoose.Schema({
  reactedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emoji: {
    type: String,
    required: true,
    enum: allowedEmojis,
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
});

reactionSchema.index({ reactedBy: 1, emoji: 1 });

const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = { Reaction };
