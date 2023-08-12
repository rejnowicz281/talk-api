const debug = require("debug")("app:messagesController");

const Room = require("../models/room");
const Message = require("../models/message");
const asyncHandler = require("../asyncHandler");

exports.create = asyncHandler(async (req, res) => {
    const roomId = req.params.roomId;

    const message = new Message({
        text: req.body.text,
        user: req.user._id,
    });

    const room = await Room.findById(roomId);

    if (!room) throw new Error("Room not found");

    if (!room.chatters.includes(req.user._id)) return res.sendStatus(403);

    room.messages.push(message);

    await room.save();

    const data = {
        message: "Message created",
        roomId,
        message,
    };

    debug(data);
    res.json(data);
});
