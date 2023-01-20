import { Schema } from "mongoose";

const NewsLetterSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  joinedOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default NewsLetterSchema;
