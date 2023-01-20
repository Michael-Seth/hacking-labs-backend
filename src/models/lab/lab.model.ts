import { model } from "mongoose";
import { ILabDocument } from "./lab.types";
import LabSchema from "./lab.schema";

export const LabModel = model<ILabDocument>("lab", LabSchema);
