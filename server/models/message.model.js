const mongoose = require("mongoose");
const { Reaction } = require("./reaction.model");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
    content: {
      type: String,
    },
    voiceUrl: {
      type: String,
    },
    voiceDuration: {
      type: Number,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reaction" }],
  },
  { timestamps: true },
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ chat: 1 });

messageSchema.methods.addReaction = async function (userId, emoji) {
  const messageId = this._id;

  const existingReaction = await Reaction.findOne({
    message: messageId,
    reactedBy: userId,
  });

  if (existingReaction) {
    if (existingReaction.emoji === emoji) {
      await Reaction.findByIdAndDelete(existingReaction._id);
      this.reactions.pull(existingReaction._id);
      await this.save();
      return { status: "removed" };
    } else {
      existingReaction.emoji = emoji;
      await existingReaction.save();
      return { status: "updated", reaction: existingReaction };
    }
  }

  const newReaction = await Reaction.create({
    reactedBy: userId,
    message: messageId,
    emoji: emoji,
  });

  this.reactions.push(newReaction._id);
  await this.save();

  return { status: "added", reaction: newReaction };
};

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
