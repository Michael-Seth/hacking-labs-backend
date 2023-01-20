import { Document, Model } from "mongoose";

export interface IMaterial {
  name: string;
  description?: string;
  machineName: string;
  storageDetails: Array<any>;
  uploadedOn: Date;
}

export interface IMaterialDocument extends IMaterial, Document {}

export interface IMaterialModel extends Model<IMaterialDocument> {}
