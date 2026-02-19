const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');

const users = [
    { _id: '507f1f77bcf86cd799439011', username: 'john_doe', email: 'john@example.com', password: bcrypt.hashSync('password123', 10) },
    { _id: '507f1f77bcf86cd799439012', username: 'jane_doe', email: 'jane@example.com', password: bcrypt.hashSync('password456', 10) },
    { _id: '507f1f77bcf86cd799439013', username: 'alice_smith', email: 'alice@example.com', password: bcrypt.hashSync('password789', 10) }
]

async function seedUsers() {
    try {
        await User.deleteMany({});
        await User.insertMany(users);
        console.log('Users seeded successfully');
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

module.exports = { seedUsers };