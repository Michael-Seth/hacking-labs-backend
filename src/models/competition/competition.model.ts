import { model } from "mongoose";
import { ICompetionDocument } from "./competition.types";
import CompetitionSchema from "./competition.schema";

export const CompetitionModel = model<ICompetionDocument>(
  "competition",
  CompetitionSchema
);
