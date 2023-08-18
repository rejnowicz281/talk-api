const debug = require("debug")("app:messagesController");

const Room = require("../models/room");
const Message = require("../models/message");
const asyncHandler = require("../asyncHandler");
const imagekit = require("../imagekit");

const { body, validationResult } = require("express-validator");

exports.create = [
    body("text")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Text is required")
        .isLength({ max: 160 })
        .withMessage("Message is too long"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        let photo = {};
        if (req.files && req.files.photo && req.files.photo.mimetype.startsWith("image")) {
            const result = await imagekit.upload({
                file: req.files.photo.data,
                fileName: req.files.photo.name,
                folder: "/talk/messages",
            });
            debug("photo upload result:", result);
            const url = imagekit.url({
                src: result.url,
                transformation: [
                    {
                        width: 400,
                        aspectRatio: "4/3",
                    },
                ],
            });
            debug("photo url:", url);
            photo.url = url;
            photo.fileId = result.fileId;
        }

        const message = await new Message({
            text: req.body.text,
            user: req.user._id,
            photo,
        }).populate("user", "username avatar");

        const roomId = req.params.roomId;

        const room = await Room.findById(roomId);

        if (!room) throw new Error("Room not found");

        if (!room.chatters.includes(req.user._id)) {
            const error = new Error("You are not authorized to send messages in this room");
            error.status = 403;
            throw error;
        }

        await Room.updateOne({ _id: roomId }, { $push: { messages: message } });

        const data = {
            message: "Message created",
            roomId,
            messageBody: message,
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

    if (!req.user._id.equals(message.user) && !req.user._id.equals(room.admin)) {
        const error = new Error("You are not authorized to delete this message");
        error.status = 403;
        throw error;
    }

    if (message.photo) {
        imagekit
            .deleteFile(message.photo.fileId)
            .then((result) => {
                debug(`ImageKit: Image ${message.photo.fileId} deleted`);
            })
            .catch((error) => {
                debug(error);
            });
    }

    await Room.updateOne({ _id: roomId }, { $pull: { messages: { _id: id } } });

    const data = {
        message: "Message destroyed successfully",
        roomId,
        messageBody: message,
    };

    debug(data);
    res.json(data);
});
