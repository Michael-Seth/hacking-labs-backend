import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";
const superagent = require("superagent");

import { UserModel } from "../../models/user/user.model";
import { MaterialModel } from "../../models/lab/material/material.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const {
  OK,
  BAD_REQUEST,
  SERVICE_UNAVAILABLE,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = StatusCodes;

export const StartMachine = {
  start: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    const { machine } = request.body;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to proceed." });
    } else {
      if (!machine) {
        return response
          .status(BAD_REQUEST)
          .json({ message: "Required field(s) missing." });
      } else {
        MaterialModel.findOne(
          { name: sanitize(machine.name) },
          (err: any, material: any) => {
            if (err) {
              return response
                .status(INTERNAL_SERVER_ERROR)
                .json({ message: "An error occurred. Please try again." });
            } else if (!material) {
              return response
                .status(BAD_REQUEST)
                .json({ message: "Unable to find a matching machine." });
            } else {
              const ami: any =
                material.storageDetails[0].ImportImageTasks[0].ImageId;
              const platform =
                material.storageDetails[0].ImportImageTasks[0].Platform;
              superagent
                .post(`${process.env.OPENVPN_SERVER_ADDRESS}/machine/start`)
                .send({ ami: ami, user: user.username, platform: platform })
                .set("Content-Type", "application/json")
                .set("accept", "json")
                .end((err: any, resp: any) => {
                  if (err) {
                    return response
                      .status(SERVICE_UNAVAILABLE)
                      .json({ error: err.text });
                  }
                });
              return response.status(OK).json({ message: "Starting machine" });
            }
          }
        );
      }
    }
  },

  obtainIP: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
              .json({ message: "An error occurred, Please try again." });
          } else if (!user) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            superagent
              .post(`${process.env.OPENVPN_SERVER_ADDRESS}/machine/get-ip`)
              .send({ user: sanitize(user.username) })
              .set("Content-Type", "application/json")
              .set("accept", "json")
              .end((err: any, resp: any) => {
                if (err) {
                  return response
                    .status(SERVICE_UNAVAILABLE)
                    .json({ error: err.text });
                } else {
                  const res = JSON.parse(resp.text);
                  if (res.error) {
                    return response
                      .status(OK)
                      .json({ message: "Machine still booting up." });
                  } else {
                    let instance: Array<any> = [];
                    instance.push(res.trim());
                    userInDB.updateOne(
                      { runninginstances: instance },
                      (err: any) => {
                        if (err) {
                          return response
                            .status(INTERNAL_SERVER_ERROR)
                            .json({
                              message: "An error occurred. Please try again.",
                            });
                        } else {
                          return response
                            .status(OK)
                            .json({ message: res.trim() });
                        }
                      }
                    );
                  }
                }
              });
          }
        }
      );
    }
  },

  stopMachine: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to proceed." });
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
              .json({ message: "Unauthorized. Kindly login to proceed." });
          } else {
            superagent
              .post(`${process.env.OPENVPN_SERVER_ADDRESS}/machine/stop`)
              .send({ user: sanitize(user.username) })
              .set("Content-Type", "application/json")
              .set("accept", "json")
              .end((err: any) => {
                if (err) {
                  return response
                    .status(SERVICE_UNAVAILABLE)
                    .json({ error: err.text });
                }
              });
            userInDB.updateOne({ runninginstances: [] }, (err: any) => {
              if (err) {
                return response
                  .status(INTERNAL_SERVER_ERROR)
                  .json({ message: "An error occurred. Please try again." });
              } else {
                return response
                  .status(OK)
                  .json({ message: "Stopping machine" });
              }
            });
          }
        }
      );
    }
  },
};
