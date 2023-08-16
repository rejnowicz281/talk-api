const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            maxLength: 160,
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        photo: { url: String, fileId: String },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

module.exports = mongoose.model("Message", messageSchema);
