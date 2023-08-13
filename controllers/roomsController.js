const debug = require("debug")("app:roomsController");

const Room = require("../models/room");
const asyncHandler = require("../asyncHandler");

const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res) => {
    const rooms = await Room.find().sort({ createdAt: -1 });

    const data = {
        message: "Room index successful",
        rooms,
    };

    debug(data);
    res.json(data);
});

exports.show = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const room = await Room.findById(id);

    if (!room) throw new Error("Room not found");

    room.messages.sort((a, b) => {
        return b.createdAt - a.createdAt;
    });

    const data = {
        message: "Room show successful",
        room,
    };

    debug(data);
    res.json(data);
});

exports.create = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Name is required")
        .isLength({ max: 50 })
        .withMessage("Name is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const room = new Room(req.body);

        room.admin = req.user._id;
        room.chatters.push(req.user._id);

        await room.save();

        const data = {
            message: "Room create successful",
            room,
        };

        debug(data);
        res.json(data);
    }),
];

exports.update = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Name is required")
        .isLength({ max: 50 })
        .withMessage("Name is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const id = req.params.id;

        const room = await Room.findById(id);

        if (!room) throw new Error("Room not found");

        if (!req.user._id.equals(room.admin)) return res.sendStatus(403);

        const newRoom = await Room.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        const data = {
            message: "Room updated successfully",
            room: newRoom,
        };

        debug(data);
        res.json(data);
    }),
];

exports.destroy = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const room = await Room.findById(id);

    if (!room) throw new Error("Room not found");

    if (!req.user._id.equals(room.admin)) return res.sendStatus(403);

    await Room.findByIdAndDelete(id);

    const data = {
        message: "Room destroyed successfully",
        roomId: id,
    };

    debug(data);
    res.json(data);
});
