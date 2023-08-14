const { Server } = require("socket.io");
const debug = require("debug")("app:socket");

let io;

exports.initSocket = function (server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        debug("a user connected");

        socket.on("disconnect", () => {
            debug("user disconnected");
        });

        socket.on("testMessage", (message) => {
            debug("Server: Test Message");
            io.emit("testMessage", message);
        });

        socket.on("joinRoom", (room) => {
            socket.join(room);
            debug("user joined room", room);
        });

        socket.on("leaveRoom", (room) => {
            socket.leave(room);
            debug("user left room", room);
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
