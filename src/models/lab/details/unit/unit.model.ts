import { model } from "mongoose";
import { IUnitDocument } from "./unit.types";
import UnitSchema from "./unit.schema";

export const UnitModel = model<IUnitDocument>("unit", UnitSchema);
