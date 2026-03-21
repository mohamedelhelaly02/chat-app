const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
    },
    content: {
        type: String
    },
    voiceUrl: {
        type: String
    },
    voiceDuration: {
        type: Number
    },
    delivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ chat: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };