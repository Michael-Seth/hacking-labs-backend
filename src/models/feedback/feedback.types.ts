import { Document, Model } from "mongoose";

export interface IFeedback {
  username: string;
  message: string;
  createdOn: Date;
}

export interface IFeedbackDocument extends IFeedback, Document {}

export interface IFeedbackModel extends Model<IFeedbackDocument> {}
