const { Chat } = require('../models/chat.model');
const chats = [
    { _id: '507f1f77bcf86cd799439014', participants: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] },
    { _id: '507f1f77bcf86cd799439015', participants: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'] },
    { _id: '507f1f77bcf86cd799439016', participants: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013'] },
]

async function seedChats() {
    try {
        await Chat.deleteMany({});
        await Chat.insertMany(chats);
        console.log('Chats seeded successfully');
    } catch (error) {
        console.error('Error seeding chats:', error);
    }
}

module.exports = { seedChats };