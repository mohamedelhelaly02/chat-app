const asyncHandler = require("../utils/asyncHandler");
const { User } = require('../models/user.model');
const httpStatusText = require('../utils/httpStatusText');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.userId } })
        .select('-password -__v -createdAt -updatedAt')
        .sort({ online: -1, lastSeen: -1 });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { users } });
});


const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId)
        .select('-password -__v');

    if (!user) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: 'User not found' });
    }

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { user } });
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const { username, email, bio } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;

    await user.save();
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { user } });
});

const changeUserAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: 'User not found' });
    }

    const avatarFile = req.files.avatar;

    const avatarPath = `uploads/avatars/${user._id}_${Date.now()}_${avatarFile.name}`;
    await avatarFile.mv(avatarPath);
    user.avatar = `${process.env.BASE_URL}/${avatarPath}`;
    await user.save();

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { avatar: user.avatar } });
});

module.exports = { getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, changeUserAvatar };