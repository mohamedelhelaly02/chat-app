const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email
    };

    const options = {
        expiresIn: '30m',
        issuer: 'chatapp',
        audience: 'chatapp',
        algorithm: 'HS256'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

const verifyJwtToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = { generateAccessToken, verifyJwtToken };