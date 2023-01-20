import { Schema } from "mongoose";

const UnitSchema = new Schema({
  heading: {
    type: String,
    required: true,
    default: "Introduction",
  },
  description: {
    type: String,
    required: true,
    default: "Welcome to this section",
  },
  unitNumber: {
    type: Number,
    required: true,
    default: 0
  },
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "task",
    },
  ],
});

export default UnitSchema;
