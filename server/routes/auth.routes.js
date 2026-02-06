const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { registerValidationSchema, loginValidationSchema } = require('../validators/authValidationSchema');

router.route('/register').post(registerValidationSchema, register);
router.route('/login').post(loginValidationSchema, login);
router.route('/logout').post(authMiddleware, logout);

module.exports = { authRouter: router };
