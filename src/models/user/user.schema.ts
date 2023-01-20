import { Schema } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    default: "",
  },
  refreshToken: [String],
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  runninginstances: {
    type: Array,
    default: [],
  },

  profilePicture: {
    type: String,
    default:
      "https://e7.pngegg.com/pngimages/908/777/png-clipart-security-hacker-computer-security-certified-ethical-hacker-white-hat-hacker-tshirt-computer-network-thumbnail.png",
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  career_path: {
    type: String,
    required: true,
    default: "redteam",
    enum: ["redteam", "blueteam"],
  },
  completedRooms: {
    type: Array,
    required: true,
    default: []
  }
});

// add lab enrolment feature

export default UserSchema;
