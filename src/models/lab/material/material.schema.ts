import { Schema } from "mongoose";

const MaterialSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
  },
  machineName: {
    type: String,
    required: true,
    default: "",
  },
  ami: {
    type: String,
    default: ""
  },
  storageDetails: {
    type: Array,
    default: [],
  },
  uploadedOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default MaterialSchema;
