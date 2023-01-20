import { Document, Model } from "mongoose";

export interface INewsLetter {
  email: string;
  joinedOn: Date;
}

export interface INewsLetterDocument extends INewsLetter, Document {}

export interface INewsLetterModel extends Model<INewsLetterDocument> {}
