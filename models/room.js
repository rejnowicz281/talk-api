const mongoose = require("mongoose");
const User = require("./user");
const Message = require("./message");

const Schema = mongoose.Schema;

const roomSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        chatters: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        messages: [Message.schema],
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

module.exports = mongoose.model("Room", roomSchema);
