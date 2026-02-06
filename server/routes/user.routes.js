const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.route('').get(authMiddleware, getAllUsers);

module.exports = { usersRouter: router };
