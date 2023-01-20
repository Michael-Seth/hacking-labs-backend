import { Schema } from "mongoose";

const TaskSchema = new Schema({
  question: {
    type: String,
    required: true,
    default: "No answer is required for this task",
  },
  answer: {
    type: String,
    required: true,
    default: "null",
  },
  isCaseSensitive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isAnswerRequired: {
    type: Boolean,
    required: true,
    default: true,
  },
  solvedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

export default TaskSchema;
