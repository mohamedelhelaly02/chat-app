const handleUserEvents = (io, socket) => {
    socket.on('userLoggedIn', ({ userId }) => {
        // update the user's online status in the database
        // emit an event to all clients to update the online users list

        console.log(`User with socket id: ${socket.id} logged in`);

        console.log(`User with id: ${userId} logged in`);



    });
}

module.exports = { handleUserEvents };