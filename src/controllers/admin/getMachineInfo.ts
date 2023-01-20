import { Request, response, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

const mime = require("mime-types");

const superagent = require("superagent");

import { UserModel } from "../../models/user/user.model";
import { MaterialModel } from "../../models/lab/material/material.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const {
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  SERVICE_UNAVAILABLE,
  OK,
  NOT_FOUND,
} = StatusCodes;

export const GetMachine = {
  info: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    const { machineInfo } = request.body;
    if (!machineInfo) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "Required field(s) missing." });
    } else {
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
                .json({ message: "An error occurred. Please try again. " });
            } else if (!userInDB) {
              return response
                .status(UNAUTHORIZED)
                .json({ message: "Unauthorized. Kindly login to continue." });
            } else {
              if (userInDB.role !== "admin") {
                return response.status(UNAUTHORIZED).json({
                  message:
                    "You are not authorized to carry out this operation.",
                });
              } else {
                MaterialModel.findOne(
                  { name: sanitize(machineInfo.name) },
                  (err: any, material: any) => {
                    if (err) {
                      return response.status(INTERNAL_SERVER_ERROR).json({
                        message: "An error occurred. Please try again.",
                      });
                    } else if (!material) {
                      return response
                        .status(NOT_FOUND)
                        .json({ message: "Material not found." });
                    } else {
                      superagent
                        .post(
                          `${process.env.OPENVPN_SERVER_ADDRESS}/machine/get-machine-status`
                        )
                        .send({ ami: material.ami })
                        .set("Content-Type", "application/json")
                        .set("accept", "json")
                        .end((err: any, resp: any) => {
                          if (err) {
                            return response
                              .status(SERVICE_UNAVAILABLE)
                              .json({ error: err.text });
                          } else {
                            const res: any = JSON.parse(JSON.parse(resp.text));
                            if (res) {
                              const completionState =
                                res.ImportImageTasks[0].SnapshotDetails[0]
                                  .Status;
                              if (completionState === "completed") {
                                material.update(
                                  { storageDetails: res },
                                  (err: any) => {
                                    if (err) {
                                      return response
                                        .status(INTERNAL_SERVER_ERROR)
                                        .json({
                                          message:
                                            "An error occurred. Please try again.",
                                        });
                                    } else {
                                      return response.status(OK).json(res);
                                    }
                                  }
                                );
                              } else {
                                return response.status(OK).json(res);
                              }
                            } else {
                              return response
                                .status(OK)
                                .json({
                                  message:
                                    "Unable to fetch machine details at this time. Please try again later.",
                                });
                            }
                          }
                        });
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
  },

  create: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    const { machineInfo } = request.body;
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
              .json({ message: "Unauthorized. Kindly login to proceed. " });
          } else {
            if (userInDB.role !== "admin") {
              return response.status(UNAUTHORIZED).json({
                message: "You are not authorized to carry out this operation.",
              });
            } else {
              superagent
                .post(
                  `${process.env.OPENVPN_SERVER_ADDRESS}/machine/create-ami`
                )
                .send({
                  key: sanitize(machineInfo.key),
                  format: "ova", // change this later to a value not hardcoded
                })
                .set("Content-Type", "application/json")
                .set("accept", "json")
                .end((err: any, resp: any) => {
                  if (err) {
                    return response
                      .status(SERVICE_UNAVAILABLE)
                      .json({ error: err.text });
                  } else {
                    const res: any = JSON.parse(JSON.parse(resp.text));
                    MaterialModel.findOne(
                      { name: sanitize(machineInfo.name) },
                      (err: any, material: any) => {
                        if (err) {
                          return response
                            .status(INTERNAL_SERVER_ERROR)
                            .json({ message: "An error occurred." });
                        } else if (!material) {
                          return response
                            .status(NOT_FOUND)
                            .json({ message: "Material not found." });
                        } else {
                          material.update(
                            { ami: res.ImportTaskId },
                            (err: any) => {
                              if (err) {
                                return response
                                  .status(INTERNAL_SERVER_ERROR)
                                  .json({ message: "An error occurred." });
                              } else {
                                return response
                                  .status(OK)
                                  .json({ message: "Conversion started." });
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                });
            }
          }
        }
      );
    }
  },
};
