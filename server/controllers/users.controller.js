const asyncHandler = require("../utils/asyncHandler");
const { User } = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const { isOnline } = require("../utils/presence"); 

const getAllUsers = asyncHandler(async (req, res) => {
  let users = await User.find({ _id: { $ne: req.userId } })
    .select("-password -__v -createdAt -updatedAt")
    .sort({ lastSeen: -1 })
    .lean();

  users = users.map(user => ({
    ...user,
    online: isOnline(user._id.toString())
  }));

  users.sort((a, b) => {
    if (a.online === b.online) return 0;
    return a.online ? -1 : 1;
  });

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("-password -__v").lean();

  if (!user) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }

  const userWithStatus = {
    ...user,
    online: isOnline(user._id.toString())
  };

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { user: userWithStatus } });
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { username, email, bio } },
    { new: true, runValidators: true }
  ).select("-password -__v").lean();

  if (!user) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }

  const userWithStatus = {
    ...user,
    online: isOnline(user._id.toString())
  };

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { user: userWithStatus } });
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }

  const avatarFile = req.files.avatar;

  console.log("Avatar file Uploaded: ", avatarFile);

  const avatarPath = `uploads/${user._id}_${Date.now()}_${avatarFile.name}`;

  console.log("Avatar Path Uploaded: ", avatarPath);

  await avatarFile.mv(avatarPath);
  user.avatar = `${process.env.BASE_URL}/${avatarPath}`;
  await user.save();

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { avatar: user.avatar } });
});

module.exports = {
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changeUserAvatar,
};
