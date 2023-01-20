import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { UserModel } from "../../models/user/user.model";
import { MaterialModel } from "../../models/lab/material/material.model";
import { DownloadMaterialModel } from "../../models/lab/downloadMaterial/downloadMaterial.model";

const {
  OK,
  FORBIDDEN,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = StatusCodes;

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

export const UploadMaterial = {
  upload: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    const { materialInfo } = request.body;
    if (!materialInfo) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "Required field(s) missing." });
    } else {
      if (!user) {
        return response
          .status(UNAUTHORIZED)
          .json({ message: "Unauthorized. Kindly login to proceed." });
      } else {
        UserModel.findOne(
          { username: user.username },
          (err: any, userInDB: any) => {
            if (err) {
              return response
                .status(INTERNAL_SERVER_ERROR)
                .json({ message: "An error occurred.Please try again." });
            } else if (!userInDB) {
              return response
                .status(UNAUTHORIZED)
                .json({ message: "Unauthorized. Kindly login to proceed." });
            } else {
              if (userInDB.role !== "admin") {
                return response.status(UNAUTHORIZED).json({
                  message:
                    "You are not authorized to carry out this operation.",
                });
              } else {
                const newMaterial = new MaterialModel({
                  name: sanitize(materialInfo.name),
                  description: sanitize(materialInfo.description),
                  machineName: sanitize(materialInfo.machineName),
                  storageDetails: materialInfo.storageDetails,
                });
                newMaterial.save((err: any) => {
                  if (err) {
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message: "An error occurred. Please try again.",
                    });
                  } else {
                    return response.status(CREATED).json({
                      message:
                        "Material has been added successfully. Please proceed to conversion page.",
                    });
                  }
                });
              }
            }
          }
        );
      }
    }
  },

  uploadDownloadableMaterial: (
    request: IGetUserAuthInfoRequest | any,
    response: Response
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to continue." });
    } else {
      UserModel.findOne(
        { username: user.username },
        (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred. Please try again later." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            if (userInDB.role !== "admin") {
              return response
                .status(FORBIDDEN)
                .json({
                  message:
                    "Forbidden. You do not have the permission to carry out this operation.",
                });
            } else {
              const { materialInfo } = request.body;
              if (!materialInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing." });
              } else {
                const newDownloadableMaterial = new DownloadMaterialModel({
                  name: sanitize(materialInfo.name),
                  description: sanitize(materialInfo.description),
                  fileName: sanitize(materialInfo.fileName),
                  storageDetails: materialInfo.storageDetails,
                });
                newDownloadableMaterial.save((err: any) => {
                  if (err) {
                    return response
                      .status(INTERNAL_SERVER_ERROR)
                      .json({
                        message: "An error occurred. Please try again.",
                      });
                  } else {
                    return response
                      .status(CREATED)
                      .json({
                        message: "Material has been added succesfully.",
                      });
                  }
                });
              }
            }
          }
        }
      );
    }
  },
};
