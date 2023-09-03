const debug = require("debug")("app:chattersController");
const createError = require("http-errors");
const Room = require("../models/room");
const asyncHandler = require("../asyncHandler");

exports.create = asyncHandler(async (req, res, next) => {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);

    if (!room) throw createError(404, "Room not found");

    if (room.chatters.includes(req.user._id)) throw createError(400, "User already in room");

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

    if (!room) throw createError(404, "Room not found");

    const id = req.params.id;

    if (!req.user._id.equals(id) && !req.user._id.equals(room.admin))
        throw createError(403, "You can't remove other users");

    if (!room.chatters.includes(id)) throw createError(400, "User not in room");

    if (room.admin.equals(id)) throw createError(400, "Admin can't leave the room");

    const newRoom = await Room.findByIdAndUpdate(
        roomId,
        {
            $pull: { chatters: id },
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
