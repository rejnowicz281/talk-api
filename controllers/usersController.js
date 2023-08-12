const debug = require("debug")("app:usersController");

const User = require("../models/user");
const asyncHandler = require("../asyncHandler");

exports.show = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) throw new Error("User not found");

    const userData = {
        username: user.username,
    };

    const data = { message: "Show User successful", user: userData };

    debug(data);
    res.json(data);
});
