const debug = require("debug")("app:messagesController");

const Room = require("../models/room");
const Message = require("../models/message");
const asyncHandler = require("../asyncHandler");

const { body, validationResult } = require("express-validator");

exports.create = [
    body("text")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Text is required")
        .isLength({ max: 160 })
        .withMessage("Message is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const roomId = req.params.roomId;

        const message = new Message({
            text: req.body.text,
            user: req.user._id,
        });

        const room = await Room.findById(roomId);

        if (!room) throw new Error("Room not found");

        if (!room.chatters.includes(req.user._id)) return res.sendStatus(403);

        await Room.updateOne({ _id: roomId }, { $push: { messages: message } });

        const data = {
            message: "Message created",
            roomId,
            message,
        };

        debug(data);
        res.json(data);
    }),
];

exports.destroy = asyncHandler(async (req, res) => {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);

    if (!room) throw new Error("Room not found");

    const id = req.params.id;

    if (!room.messages.id(id)) throw new Error("Message not found");

    const message = room.messages.id(id);

    if (!req.user._id.equals(message.user) && !req.user._id.equals(room.admin)) return res.sendStatus(403);

    await Room.updateOne({ _id: roomId }, { $pull: { messages: { _id: id } } });

    const data = {
        message: "Message destroyed successfully",
        roomId,
        messageBody: message,
    };

    debug(data);
    res.json(data);
});
