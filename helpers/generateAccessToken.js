const jwt = require("jsonwebtoken");

module.exports = function generateAccessToken(user) {
    const payload = {
        sub: user.id,
        username: user.username,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" });
};
