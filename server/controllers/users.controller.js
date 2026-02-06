const asyncHandler = require("../utils/asyncHandler");
const { User } = require('../models/user.model');
const httpStatusText = require('../utils/httpStatusText');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.userId } })
        .select('-password -__v -createdAt -updatedAt')
        .sort({ online: -1, lastSeen: -1 });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { users } });
});

module.exports = { getAllUsers };