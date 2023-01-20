import { model } from "mongoose";
import { ITaskDocument } from "./task.types";
import TaskSchema from "./task.schema";

export const TaskModel = model<ITaskDocument>("task", TaskSchema);
