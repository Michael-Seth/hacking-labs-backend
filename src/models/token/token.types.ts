import { Document, Model, Schema } from "mongoose";

export interface IToken {
  _userID: Array<Schema.Types.ObjectId>;
  token: string;
  tokenType: string;
  createdAt: Date;
}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {}
