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


module.exports = { getAllUsers, getCurrentUserProfile };