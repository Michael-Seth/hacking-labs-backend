import { Document, Model, Schema } from "mongoose";

export interface ITask {
  question: string;
  answer: string;
  isCaseSensitive?: Boolean;
  isAnswerRequired?: Boolean;
  solvedBy: Array<Schema.Types.ObjectId>;
}

export interface ITaskDocument extends ITask, Document {}

export interface ITaskModel extends Model<ITaskDocument> {}
