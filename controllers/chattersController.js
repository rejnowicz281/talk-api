// create, destroy
const debug = require("debug")("app:chattersController");

const Room = require("../models/room");
const asyncHandler = require("../asyncHandler");

exports.create = asyncHandler(async (req, res, next) => {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);

    if (!room) throw new Error("Room not found");

    if (room.chatters.includes(req.user._id)) {
        const error = new Error("Chatter already in room");
        error.status = 400;
        throw error;
    }

    const newRoom = await Room.findByIdAndUpdate(
        roomId,
        {
            $push: { chatters: req.user._id },
        },
        { new: true }
    );

    const data = {
        message: "Chatter added to room",
        userId: req.user._id,
        room: newRoom,
    };

    debug(data);
    res.json(data);
});

exports.destroy = asyncHandler(async (req, res, next) => {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);

    if (!room) throw new Error("Room not found");

    if (!room.chatters.includes(req.user._id)) {
        const error = new Error("User not in room");
        error.status = 400;
        throw error;
    }

    if (room.admin.equals(req.user._id)) {
        const error = new Error("Admin can't leave the room");
        error.status = 400;
        throw error;
    }

    const newRoom = await Room.findByIdAndUpdate(
        roomId,
        {
            $pull: { chatters: req.user._id },
        },
        { new: true }
    );

    const data = {
        message: "Chatter removed from room",
        userId: req.user._id,
        room: newRoom,
    };

    debug(data);
    res.json(data);
});
