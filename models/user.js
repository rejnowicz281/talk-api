const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
    },
    subject: {
        type: String,
    },
});

module.exports = mongoose.model("User", userSchema);
