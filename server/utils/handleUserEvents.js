const { User } = require('../models/user.model');
const { Chat } = require('../models/chat.model');

const handleUserEvents = (io, socket) => {
    socket.on('user:login', async ({ userId }) => {
        // update the user's online status in the database
        // emit an event to all clients to update the online users list

        console.log(`User with socket id: ${socket.id} logged in`);

        console.log(`User with id: ${userId} logged in`);

        const user = await User.findById(userId);

        if (!user) {
            console.error(`User with id: ${userId} not found`);
            return;
        }

        socket.broadcast.emit('user:online', { userId, online: true, username: user.username });

    });

    socket.on('user:registered', async ({ userId }) => {
        console.log(`User with id: ${userId} registered`);

        const updatedUser = await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() });

        // emit to other clients that a new user has registered and is online

        socket.broadcast.emit('user:statusChanged', { userId, online: true, username: updatedUser.username });

    });

    socket.on('user:logout', async ({ userId }) => {
        console.log(`User with socket id: ${socket.id} logged out`);
        console.log(`User with id: ${userId} logged out`);

        const updatedUser = await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });

        socket.broadcast.emit('user:statusChanged', { userId, online: false, username: updatedUser.username });

    });

    socket.on('user:typing', async ({ toUserId, fromUserId, isTyping }) => {

        if (!toUserId || !fromUserId) {
            console.warn('Invalid typing payload');
            return;
        }

        console.log(
            `User ${fromUserId} is ${isTyping ? 'typing...' : 'stopped typing'} to ${toUserId}`
        );
        const user = await User.findById(toUserId);

        if (!user) {
            console.error(`User with id: ${toUserId} not found`);
            return;
        }

        io.to(toUserId).emit('user:typing', { userId: fromUserId, isTyping });
    });

    socket.on('user:new_message', async ({ toUserId, fromUserId, message }) => {
        try {

            if (!message)
                return;

            const updatedChat = await Chat.findOne({ _id: message.chat })
                .populate('participants', 'username email avatar online lastSeen')
                .populate({
                    path: 'lastMessage',
                    populate: {
                        path: 'sender',
                        select: 'username avatar'
                    }
                });

            io.to(toUserId).emit('chat:updated', { chat: updatedChat });
            io.to(fromUserId).emit('chat:updated', { chat: updatedChat });


        } catch (error) {
            console.error('Error emitting new message:', error);
        }
    });

}

module.exports = { handleUserEvents };