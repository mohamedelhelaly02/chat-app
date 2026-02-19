const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const PORT = process.env.PORT || 4000;
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const { authRouter } = require('../server/routes/auth.routes');
const { chatRouter } = require('../server/routes/chat.routes');
const { usersRouter } = require('../server/routes/user.routes');
const { globalErrorHandler } = require('./middlewares/globalErrorHandler');
const path = require('path');
const { seedUsers } = require('./utils/seedUsers');
const { seedChats } = require('./utils/seedChats');
const { handleUserEvents } = require('./utils/handleUserEvents');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to mongodb');
        seedUsers();
        seedChats();
    })
    .catch((err) => console.error(`Connection error: ${err}`));

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/users', usersRouter);
app.use(globalErrorHandler);

io.on('connection', (socket) => {
    console.log(`User connected with socket id: ${socket.id}`);
    const userId = socket.handshake.query.userId;
    socket.join(userId);

    handleUserEvents(io, socket);

    socket.on('disconnect', () => {
        console.log(`User with socket id: ${socket.id} disconnected`);
    });

});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Websocket running on ws://localhost:${PORT}`);
});