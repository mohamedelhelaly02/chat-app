const allowedAvatarTypes = ['image/jpeg', 'image/png'];
const httpStatusText = require('../utils/httpStatusText');

const allowedUserAvatarTypes = (req, res, next) => {
    if (!req.files || !req.files.avatar) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: 'No avatar file uploaded' });
    }

    const avatarFile = req.files.avatar;

    if (!allowedAvatarTypes.includes(avatarFile.mimetype)) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid file type. Only JPEG and PNG are allowed.' });
    }

    next();
};

module.exports = allowedUserAvatarTypes;