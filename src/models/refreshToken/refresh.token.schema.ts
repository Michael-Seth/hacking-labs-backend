import { Schema } from "mongoose";

const RefreshTokenSchema = new Schema({
  _userID: 
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  
  token: {
    type: String,
    required: true,
  },


}, {timestamps:true});

export default RefreshTokenSchema;
