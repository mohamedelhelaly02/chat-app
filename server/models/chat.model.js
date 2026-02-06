const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    chatType: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

chatSchema.index({ participants: 1 });

chatSchema.statics.getOrCreateChat = async function (user1Id, user2Id) {
    let chat = await this.findOne({
        chatType: 'private',
        participants: { $all: [user1Id, user2Id] }
    }).populate('participants', 'username email avatar online lastSeen')
        .populate('lastMessage');

    if (!chat) {
        chat = await this.create({
            participants: [user1Id, user2Id],
            chatType: 'private',
            unreadCount: {
                [user1Id]: 0,
                [user2Id]: 0
            }
        });

        chat = await chat.populate('participants', 'username email avatar online lastSeen');
    }

    return chat;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Chat };