import { model } from "mongoose";
import { IMaterialDocument } from "./material.types";
import MaterialSchema from "./material.schema";

export const MaterialModel = model<IMaterialDocument>(
  "material",
  MaterialSchema
);
