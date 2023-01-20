import { model } from "mongoose";
import { INewsLetterDocument } from "./newsletter.types";
import NewsLetterSchema from "./newsletter.schema";

export const NewsLetterModel = model<INewsLetterDocument>(
  "newsletter",
  NewsLetterSchema
);
