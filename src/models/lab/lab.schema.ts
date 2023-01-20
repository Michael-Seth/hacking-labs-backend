import { Schema } from "mongoose";

const LabSchema = new Schema({
  ID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    default: "A lab for learning Cyber Security",
  },
  category: {
    type: String,
    required: true,
    enum: [
      "web",
      "linux",
      "forensics",
      "windows",
      "cryptography",
      "all",
      "osint",
    ],
    default: "web",
  },
  tags: {
    type: Array,
    default: [],
  },
  details: [
    {
      type: Schema.Types.ObjectId,
      ref: "unit",
    },
  ],
  machineInfo: {
    type: Array,
    default: [],
  },
  path: {
    type: String,
    required: true,
    default: "redteam",
    enum: ["redteam", "blueteam"],
  },
  labType: {
    type: String,
    required: true,
    default: "material",
    enum: ["material", "machine"],
  },
  labImage: {
    type: String,
    required: true,
    default: "https://www.pngall.com/wp-content/uploads/5/Brain-Learning.png",
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default LabSchema;
