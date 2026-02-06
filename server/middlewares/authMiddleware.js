const { verifyJwtToken } = require('../utils/jwt');
const { User } = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ status: 'fail', message: 'token is required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyJwtToken(token);
        if (decoded === null) {
            return res.status(403).json({ status: 'fail', message: 'Invalid or expired token' });
        }

        req.userId = decoded.id;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'Unknown user' })
        }

        next();

    } catch (error) {
        return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;