const asyncHandler = require("../utils/asyncHandler");
const { User } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyJwtToken,
} = require("../utils/jwt");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const { RefreshToken } = require("../models/refreshToken.model");

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
};

const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    return next(
      appError.create("User already existed", 400, httpStatusText.FAIL),
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  return res.status(201).json();
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      appError.create("Invalid email or password", 400, httpStatusText.FAIL),
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(
      appError.create("Invalid email or password", 400, httpStatusText.FAIL),
    );
  }

  user.online = true;
  user.lastSeen = new Date();

  await user.save();

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  const session = await RefreshToken.create({
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json({
      status: "success",
      token: accessToken,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
});

const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const payload = verifyJwtToken(refreshToken);
    if (payload) {
      await RefreshToken.findOneAndDelete({ userId: req.userId });
    }
  }

  await User.findByIdAndUpdate(req.userId, {
    online: false,
    lastSeen: new Date(),
  });

  return res
    .clearCookie("refreshToken")
    .status(200)
    .json({ status: "success", message: "Logout success" });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return next(
      appError.create("Unauthorized", 401, httpStatusText.UNAUTHORIZED),
    );

  const payload = verifyJwtToken(refreshToken);

  if (payload === null) {
    return next(
      appError.create("Unauthorized", 401, httpStatusText.UNAUTHORIZED),
    );
  }

  const hashedRefreshToken = hashToken(refreshToken);

  const existedSession = await RefreshToken.findOne({
    userId: payload.sub,
    refreshTokenHash: hashedRefreshToken,
  });

  if (!existedSession) {
    return next(appError.create("Forbid", 403, httpStatusText.FORBIDDEN));
  }

  if (hashedRefreshToken !== existedSession.refreshTokenHash) {
    return next(appError.create("Forbid", 403, httpStatusText.FORBIDDEN));
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return next(
      appError.create("Unauthorized", 401, httpStatusText.UNAUTHORIZED),
    );
  }
  const newRefreshToken = generateRefreshToken(user);
  const newAccessToken = generateAccessToken(user);

  existedSession.refreshTokenHash = hashToken(newRefreshToken);
  existedSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await existedSession.save();

  return res
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json({ accessToken: newAccessToken });
});

module.exports = { register, login, logout, refreshToken };
