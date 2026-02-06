const asyncHandler = require("../utils/asyncHandler");
const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateAccessToken } = require('../utils/jwt');

const register = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        return res.status(400).json({ status: 'fail', message: 'User already existed' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        email,
        password: hashedPassword
    });

    await user.save();

    const accessToken = generateAccessToken(user);

    return res.status(201).json({
        status: 'success',
        message: 'Register success',
        token: accessToken,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            }
        }
    });

});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ status: 'fail', message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(400).json({ status: 'fail', message: 'Invalid email or password' });
    }

    user.online = true;
    user.lastSeen = new Date();

    await user.save();

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
        status: 'success',
        message: 'Login success',
        token: accessToken,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        }
    })
});

const logout = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.userId, { online: false, lastSeen: new Date() });
    return res.status(200).json({ status: 'success', message: 'Logout success' })
});

module.exports = { register, login, logout };