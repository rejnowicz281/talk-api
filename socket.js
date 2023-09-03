const { Server } = require("socket.io");
const debug = require("debug")("app:socket");

let io;

const loggedUsers = [];

exports.initSocket = function (server) {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "https://rejnowicz281.github.io/talk"],
        },
    });

    io.on("connection", (socket) => {
        debug("a user connected");

        // Active users
        socket.on("login", (user) => {
            if (!loggedUsers.some((loggedUser) => loggedUser._id === user._id))
                loggedUsers.push({ ...user, socketId: socket.id });

            io.emit("updateLoggedUsers", loggedUsers);
        });

        socket.on("logout", (userId) => {
            debug(`user ${userId} logged out`);
            const index = loggedUsers.findIndex((loggedUser) => loggedUser._id === userId);
            if (index > -1) loggedUsers.splice(index, 1);

            io.emit("updateLoggedUsers", loggedUsers);
        });

        socket.on("updateLoggedUsers", (loggedUsers) => {
            debug("update logged users", loggedUsers);
            io.emit("updateLoggedUsers", loggedUsers);
        });

        socket.on("disconnect", () => {
            debug("user disconnected");

            const index = loggedUsers.findIndex((loggedUser) => loggedUser.socketId === socket.id);
            if (index > -1) loggedUsers.splice(index, 1);

            io.emit("updateLoggedUsers", loggedUsers);
        });

        // Room
        socket.on("createRoom", (room) => {
            debug("create room", room);
            io.emit("createRoom", room);
        });

        socket.on("removeRoom", (room) => {
            debug("remove room", room);
            io.emit("removeRoom", room);
        });

        socket.on("updateRoom", (roomId, name) => {
            debug("update room", roomId, "with new name", name);
            io.emit("updateRoom", roomId, name);
        });

        socket.on("joinRoom", (room) => {
            socket.join(room);
            debug("user joined room", room);
        });

        socket.on("leaveRoom", (room) => {
            socket.leave(room);
            debug("user left room", room);
        });

        // Room messages
        socket.on("addMessage", (room, message) => {
            debug(room, "add message:", message);
            io.to(room).emit("addMessage", message);
        });

        socket.on("removeMessage", (room, messageId) => {
            debug(room, "remove message:", messageId);
            io.to(room).emit("removeMessage", messageId);
        });

        // Room chatters
        socket.on("removeChatter", (room, chatterId) => {
            debug(room, "remove chatter:", chatterId);
            io.to(room).emit("removeChatter", chatterId);
        });

        socket.on("addChatter", (room, user) => {
            debug(room, "chatter joins: ", user);
            io.to(room).emit("addChatter", user);
        });
    });
};

exports.getSocketInstance = function () {
    return io;
};
