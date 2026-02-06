const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout
} = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/authMiddleware');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(authMiddleware, logout);

module.exports = { authRouter: router };
