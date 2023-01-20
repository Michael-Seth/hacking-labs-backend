import { Document, Model, Schema } from "mongoose";

export interface ILab {
  ID: string;
  name: string;
  description: string;
  category: string;
  tags?: Array<string>;
  details: Array<Schema.Types.ObjectId>;
  machineInfo: Array<any>;
  path: string;
  labType: string;
  labImage: string;
  totalPoints: number;
}

export interface ILabDocument extends ILab, Document {}

export interface ILabModel extends Model<ILabDocument> {}
