import { model } from "mongoose";
import { IFeedbackDocument } from "./feedback.types";
import FeedbackSchema from "./feedback.schema";

export const FeedbackModel = model<IFeedbackDocument>(
  "feedback",
  FeedbackSchema
);
