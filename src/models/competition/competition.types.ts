import { Document, Model } from "mongoose";

export interface ICompetition {
  name: string;
  details: string;
  createdOn: Date;
}

export interface ICompetionDocument extends ICompetition, Document {}

export interface ICompetitionModel extends Model<ICompetionDocument> {}
