require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth.routes");
const { chatRouter } = require("./routes/chat.routes");
const { usersRouter } = require("./routes/user.routes");
const { globalErrorHandler } = require("./middlewares/globalErrorHandler");
const { handleUserEvents } = require("./utils/handleUserEvents");
const appError = require("./utils/appError");
const httpStatusText = require("./utils/httpStatusText");
const { verifyJwtToken } = require("./utils/jwt");

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONT_END_URI,
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(`DB Connection error: ${err}`));

app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONT_END_URI, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/users", usersRouter);

app.all("", (req, res, next) => {
  next(
    appError.create(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      httpStatusText.FAIL,
    ),
  );
});

app.use(globalErrorHandler);

io.use((socket, next) => {
  try {
    const accessToken = socket.handshake.auth.token;
    if (!accessToken) {
      return next(
        appError.create(
          "Authentication error",
          401,
          httpStatusText.UNAUTHORIZED,
        ),
      );
    }

    const decoded = verifyJwtToken(accessToken);
    if (!decoded) {
      return next(appError.create("Forbidden", 403, httpStatusText.FORBIDDEN));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    return next(
      appError.create("Authentication error", 401, httpStatusText.UNAUTHORIZED),
    );
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  socket.join(socket.user.id);

  handleUserEvents(io, socket);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
