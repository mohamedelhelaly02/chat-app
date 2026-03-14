const onlineUsers = new Map();

module.exports = {
  addUser: (userId, socketId) => onlineUsers.set(userId, socketId),
  removeUser: (userId) => onlineUsers.delete(userId),
  isOnline: (userId) => onlineUsers.has(userId),
  getSocketId: (userId) => onlineUsers.get(userId),
  getAllOnlineCount: () => onlineUsers.size,
};
