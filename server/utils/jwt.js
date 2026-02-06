const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email
    };

    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: process.env.JWT_VALID_ISSUER,
        audience: process.env.JWT_VALID_AUDIENCE,
        algorithm: process.env.JWT_ALGORITHM
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