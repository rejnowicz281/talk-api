const debug = require("debug")("app:roomsController");
const Room = require("../models/room");
const asyncHandler = require("../asyncHandler");
const createError = require("http-errors");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res) => {
    const rooms = await Room.find().sort({ createdAt: -1 }).select("name");

    const data = {
        message: "Room index successful",
        rooms,
    };

    debug(data);
    res.json(data);
});

exports.show = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const room = await Room.findById(id)
        .populate("chatters", "username avatar")
        .populate("messages.user", "username avatar");

    if (!room) throw createError(404, "Room not found");

    room.messages.sort((a, b) => {
        return a.createdAt - b.createdAt;
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
        .withMessage("Name is required")
        .isLength({ max: 50 })
        .withMessage("Name is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const room = await new Room({
            ...req.body,
            admin: req.user._id,
            chatters: [req.user._id],
        });

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
        .withMessage("Name is required")
        .isLength({ max: 50 })
        .withMessage("Name is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const id = req.params.id;

        const room = await Room.findById(id);

        if (!room) throw createError(404, "Room not found");

        if (!req.user._id.equals(room.admin)) throw createError(403, "You are not authorized to update this room");

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

    if (!room) throw createError(404, "Room not found");

    if (!req.user._id.equals(room.admin)) throw createError(403, "You are not authorized to delete this room");

    await Room.findByIdAndDelete(id);

    const data = {
        message: "Room destroyed successfully",
        roomId: id,
    };

    debug(data);
    res.json(data);
});
