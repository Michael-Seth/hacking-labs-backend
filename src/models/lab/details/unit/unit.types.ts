import { Document, Model, Schema } from "mongoose";

export interface IUnit {
  heading: string;
  description: string;
  unitNumber: number;
  tasks: Array<Schema.Types.ObjectId>;
}

export interface IUnitDocument extends IUnit, Document {}

export interface IUnitModel extends Model<IUnitDocument> {}
