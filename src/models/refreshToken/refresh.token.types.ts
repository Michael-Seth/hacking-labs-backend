import { Document, Model, Schema } from "mongoose";

export interface IToken {
    _userID: string;
  token: string;

}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {}
