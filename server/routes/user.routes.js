const express = require('express');
const router = express.Router();
const { getAllUsers, getCurrentUserProfile } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.route('').get(authMiddleware, getAllUsers);

router.route('/me/profile').get(authMiddleware, getCurrentUserProfile);

module.exports = { usersRouter: router };
