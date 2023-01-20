import { Schema } from "mongoose";

const DownloadMaterialSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  fileName: {
    type: String,
    required: true
  },
  storageDetails: {
    type: String,
    required: true,
  },
  uploadedOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default DownloadMaterialSchema;
