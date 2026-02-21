const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    sub: user._id,
  };

  const options = {
    expiresIn: "1m",
    issuer: "chatapp",
    audience: "chatapp",
    algorithm: "HS256",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, sub: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  verifyJwtToken,
  generateRefreshToken,
  hashToken,
};
