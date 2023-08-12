const jwt = require("jsonwebtoken");

module.exports = function generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "6h" });
};
