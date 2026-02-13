const express = require('express');
const router = express.Router();
const { getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, changeUserAvatar } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const fileUpload = require('express-fileupload');
const allowedUserAvatarTypes = require('../middlewares/allowedUserAvatarTypes');

router.route('').get(authMiddleware, getAllUsers);

router.route('/me/profile').get(authMiddleware, getCurrentUserProfile);
router.route('/me/profile').put(authMiddleware, updateCurrentUserProfile);

router.route('/me/avatar').post(
    authMiddleware,
    fileUpload({ createParentPath: true }),
    allowedUserAvatarTypes,
    changeUserAvatar
);

module.exports = { usersRouter: router };
