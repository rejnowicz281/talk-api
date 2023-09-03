const jwt = require("jsonwebtoken");

exports.generateAccessToken = function (user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            avatar: user.avatar,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "6h" }
    );
};

exports.generateRefreshToken = function (userId) {
    return jwt.sign(
        {
            sub: userId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};
