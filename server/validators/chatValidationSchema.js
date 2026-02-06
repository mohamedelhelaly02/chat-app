const { body } = require("express-validator")
const mongoose = require('mongoose');

const getOrCreateChatValidator = () => {
    return [
        body('userId')
            .notEmpty()
            .withMessage('UserId is required')
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid user id');
                }
                return true;
            }).custom((value, { req }) => {
                if (value === req.userId) {
                    throw new Error('Can not create chat with yourself');
                }
                return true;
            })
    ]
};

module.exports = { getOrCreateChatValidator };