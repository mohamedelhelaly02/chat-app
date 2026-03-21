const { body } = require('express-validator');

const registerValidationSchema = () => {
    return [
        body('username')
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),

        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),

        body('password')
            .notEmpty().withMessage('password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')

    ];
}


const loginValidationSchema = () => {
    return [
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),

        body('password')
            .notEmpty().withMessage('password is required')
    ];
}


module.exports = { registerValidationSchema, loginValidationSchema };