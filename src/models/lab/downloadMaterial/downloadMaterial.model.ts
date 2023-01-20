import { model } from "mongoose";
import { IDownloadMaterialDocument } from "./downloadMaterial.types";
import DownloadMaterialSchema from "./downloadMaterial.schema";

export const DownloadMaterialModel = model<IDownloadMaterialDocument>(
  "downloadmaterial",
  DownloadMaterialSchema
);
