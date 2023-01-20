import { Schema } from "mongoose";

const TokenSchema = new Schema({
    _userID: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user"
    }],
    token: {
        type: String,
        required: true
    },
    tokenType: {
        type: String,
        required: true,
        enum: ["registration", "reset"],
        default: "registration"
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 600
    }
});

export default TokenSchema;