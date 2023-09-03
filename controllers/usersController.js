const debug = require("debug")("app:usersController");

const User = require("../models/user");
const Room = require("../models/room");

const asyncHandler = require("../asyncHandler");

exports.show = asyncHandler(async (req, res) => {
    const username = req.params.username;

    const user = await User.findOne({ username });

    if (!user) throw createError(404, "User not found");

    const rooms = await Room.find({ chatters: user._id }).select("name admin").sort({ createdAt: -1 });
    const userData = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        chatterRooms: rooms,
    };

    const data = { message: "Show User successful", user: userData };

    debug(data);
    res.json(data);
});
