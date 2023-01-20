import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { UserModel } from "../../models/user/user.model";
import { MaterialModel } from "../../models/lab/material/material.model";
import { DownloadMaterialModel } from "../../models/lab/downloadMaterial/downloadMaterial.model";
import { LabModel } from "../../models/lab/lab.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } =
  StatusCodes;

export const GetMachineInfo = {
  getLabMachines: (
    request: IGetUserAuthInfoRequest | any,
    response: Response
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to proceed." });
    } else {
      let machineList: Array<any> = [];
      MaterialModel.find({}, (err: any, machines: any) => {
        if (err) {
          return response
            .status(INTERNAL_SERVER_ERROR)
            .json({ message: "An error occurred. Please try again." });
        } else {
          Object.values(machines).map((machine: any) => {
            console.log(machine.storageDetails);
            const toPush = {
              name: machine.name,
              platform: "Not available"
              // platform: machine.storageDetails.ImportImageTasks  >= 1 ?  machine.storageDetails[0].ImportImageTasks[0].Platform : "Not available"
            };
            machineList.push(toPush);
          });
          return response.status(OK).json(machineList);
        }
      });
    }
  },

  getMachines: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to proceed." });
    } else {
      let machineList: Array<any> = [];
      DownloadMaterialModel.find({}, (err: any, machines: any) => {
        if (err) {
          return response
            .status(INTERNAL_SERVER_ERROR)
            .json({ message: "An error occurred. Please try again." });
        } else {
          Object.values(machines).map((machine: any) => {
            machineList.push(machine.name);
          });
          return response.status(OK).json(machineList);
        }
      });
    }
  },

  getMachine: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    const { machineID } = request.params;
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
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to proceed." });
          } else {
            if (!machineID) {
              return response
                .status(BAD_REQUEST)
                .json({ message: "Required field(s) missing." });
            } else {
              LabModel.findOne(
                { ID: sanitize(machineID) },
                (err: any, lab: any) => {
                  if (err) {
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message: "An error occurred. Please try again.",
                    });
                  } else if (!lab) {
                    return response
                      .status(NOT_FOUND)
                      .json({ message: "Lab not found" });
                  } else {
                    if (lab.labType === "material") {
                      DownloadMaterialModel.findOne(
                        {
                          name: lab.machineInfo[0],
                        },
                        (err: any, materialInDB: any) => {
                          if (err) {
                            return response.status(INTERNAL_SERVER_ERROR).json({
                              message: "An error occurred. Please try again.",
                            });
                          } else {
                            if (!materialInDB) {
                              return response
                                .status(NOT_FOUND)
                                .json({ message: "Material not found." });
                            } else {
                              return response.status(OK).json(materialInDB);
                            }
                          }
                        }
                      );
                    } else {
                      if (lab.machineInfo) {
                        MaterialModel.findOne(
                          { name: lab.machineInfo[0] },
                          (err: any, machine: any) => {
                            if (err) {
                              return response
                                .status(INTERNAL_SERVER_ERROR)
                                .json({
                                  message:
                                    "An error occurred. Please try again.",
                                });
                            } else if (!machine) {
                              return response
                                .status(NOT_FOUND)
                                .json({ message: "Machine not found." });
                            } else {
                              const info =
                                machine.storageDetails[0].ImportImageTasks[0];
                              if (userInDB.role === "admin") {
                                return response.status(OK).json(info);
                              } else {
                                const dataToSend = {
                                  name: machine.name,
                                  platform: info.Platform,
                                  architecture: info.Architecture,
                                };
                                return response.status(OK).json(dataToSend);
                              }
                            }
                          }
                        );
                      } else {
                        return response.status(200).json({
                          message: "No machine attached to this lab yet",
                        });
                      }
                    }
                  }
                }
              );
            }
          }
        }
      );
    }
  },

  getRunningInstance: (
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
        { username: sanitize(user.username) },
        (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            return response
              .status(OK)
              .json({ message: userInDB.runninginstances[0] });
          }
        }
      );
    }
  },
};
