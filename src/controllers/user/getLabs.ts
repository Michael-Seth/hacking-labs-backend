import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

// import { UserModel } from "../../models/user/user.model";
import { LabModel } from "../../models/lab/lab.model";
import { UnitModel } from "../../models/lab/details/unit/unit.model";
import { TaskModel } from "../../models/lab/details/task/task.model";
import { UserModel } from "../../models/user/user.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, BAD_REQUEST, NOT_FOUND } =
  StatusCodes;

export const GetLabInfo = {
  getLabs: (_: Request, response: Response) => {
    LabModel.find({}, (err: any, labs: any) => {
      if (err) {
        return response.status(INTERNAL_SERVER_ERROR).json({
          message: "Unable to fetch labs information. Please try again.",
        });
      } else {
        if (labs.length < 1) {
          return response.status(OK).json({ message: [] });
        } else {
          let dataToSend: Array<Object> = [];
          Object.values(labs).map((lab: any) => {
            const data: any = {
              _id: lab._id,
              id: lab.ID,
              name: lab.name,
              description: lab.description,
              category: lab.category,
              tags: lab.tags,
            };
            dataToSend.push(data);
          });
          return response.status(200).json(dataToSend);
        }
      }
    });
  },
  getLab: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to continue." });
    } else {
      const { labID } = request.params;
      if (!labID) {
        return response
          .status(BAD_REQUEST)
          .json({ message: "Required field(s) is missing." });
      } else {
        LabModel.findOne({ ID: sanitize(labID) })
          .populate("details")
          .exec((err: any, lab: any) => {
            if (err) {
              return response
                .status(INTERNAL_SERVER_ERROR)
                .json({ message: err.message });
            } else if (!lab) {
              return response.status(NOT_FOUND).json({
                message: "We are unable to find a lab with matching ID.",
              });
            } else {
              let details: Array<Object> = [];
              Object.values(lab.details).map((detail: any) => {
                UnitModel.findOne({ _id: detail._id })
                  .sort({ unitNumber: 1 })
                  .populate("tasks")
                  .exec((err: any, unit: any) => {
                    if (err) {
                      return response
                        .status(INTERNAL_SERVER_ERROR)
                        .json({ message: err.message });
                    } else {
                      Object.values(unit.tasks).map((task: any) => {
                        UserModel.findOne(
                          { username: user.username },
                          (err: any, userInDB: any) => {
                            if (err) {
                              return response
                                .status(INTERNAL_SERVER_ERROR)
                                .json({
                                  message:
                                    "An error occurred. Please try again.",
                                });
                            } else if (!userInDB) {
                              return response
                                .status(UNAUTHORIZED)
                                .json({ message: "Kindly login to continue." });
                            } else {
                              if (userInDB.role !== "admin") {
                                TaskModel.findOne(
                                  { _id: task._id },
                                  (err: any, taskInDB: any) => {
                                    if (err) {
                                      return response
                                        .status(INTERNAL_SERVER_ERROR)
                                        .json({
                                          message:
                                            "An error occurred. Please try again.",
                                        });
                                    } else {
                                      let hasSolved: Boolean = false;
                                      task.isCaseSensitive = undefined;
                                      task.solvedBy = undefined;
                                      task.__v = undefined;
                                      Object.values(taskInDB.solvedBy).map(
                                        (solve: any) => {
                                          if (
                                            solve.toString() ===
                                            userInDB._id.toString()
                                          ) {
                                            hasSolved = true;
                                          }
                                        }
                                      );
                                      if (hasSolved) {
                                        task.answer = task.answer;
                                      } else {
                                        task.answer = undefined;
                                      }
                                    }
                                  }
                                );
                              }
                            }
                          }
                        );
                      });
                      details.push(unit);
                    }
                  });
              });
              setTimeout(() => {
                lab.details = details;
                return response.status(OK).json(lab);
              }, 1000);
            }
          });
      }
    }
  },
  checkTaskAnswer: (
    request: IGetUserAuthInfoRequest | any,
    response: Response
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Kindly login to continue." });
    } else {
      const { taskSubmitted } = request.body;
      if (!taskSubmitted) {
        return response
          .status(BAD_REQUEST)
          .json({ message: "Required field(s) is missing." });
      } else {
        TaskModel.findOne(
          { _id: sanitize(taskSubmitted.id) },
          (err: any, task: any) => {
            if (err) {
              return response
                .status(INTERNAL_SERVER_ERROR)
                .json({ message: "An error occurred. Please try again." });
            } else if (!task) {
              return response
                .status(NOT_FOUND)
                .json({ message: "Error finding specified task." });
            } else {
              let messageToSend: any = {};
              if (
                task.answer === "null" ||
                task.answer === "No answer needed"
              ) {
                messageToSend.check = "Correct";
              } else {
                if (taskSubmitted.answer === task.answer) {
                  messageToSend.check = "Correct";
                  UserModel.findOne(
                    { username: user.username },
                    (err: any, userInDB: any) => {
                      if (err) {
                        return response
                          .status(INTERNAL_SERVER_ERROR)
                          .json(err.message);
                      } else if (!userInDB) {
                        return response
                          .status(UNAUTHORIZED)
                          .json({ message: "Please login to continue." });
                      } else {
                        let matchedUser: any = [];
                        Object.values(task.solvedBy).map((solve: any) => {
                          if (solve.toString() === userInDB._id.toString()) {
                            matchedUser.push(userInDB._id);
                          }
                        });
                        if (matchedUser.length === 0) {
                          task.solvedBy.push(userInDB._id);
                          task.save((err: any) => {
                            if (err) {
                              return response
                                .status(INTERNAL_SERVER_ERROR)
                                .json({
                                  message:
                                    "An error occured. Please try again later.",
                                });
                            } else {
                              userInDB.updateOne(
                                { points: userInDB.points + 50 },
                                (err: any) => {
                                  if (err) {
                                    return response
                                      .status(INTERNAL_SERVER_ERROR)
                                      .json({
                                        message:
                                          "An error occurred. Please try again later.",
                                      });
                                  }
                                }
                              );
                            }
                          });
                        }
                      }
                    }
                  );
                } else {
                  messageToSend.check = "Incorrect";
                }
              }
              return response.status(OK).json(messageToSend);
            }
          }
        );
      }
    }
  },

  checkCompletionStatus: (
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
            return response.status(INTERNAL_SERVER_ERROR).json({
              message: "An error occurred. Please try again.",
            });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            const { labInfo } = request.body;
            if (!labInfo) {
              return response
                .status(BAD_REQUEST)
                .json({ message: "Required field(s) missing." });
            } else {
              LabModel.findOne({ ID: sanitize(labInfo.labID) })
                .populate("details")
                .exec((err: any, labInDB: any) => {
                  if (err) {
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message: "An error occurred. Please try again.",
                    });
                  } else if (!labInDB) {
                    return response.status(NOT_FOUND).json({
                      message:
                        "Unable to find a matching lab with the specified ID.",
                    });
                  } else {
                    let numberOfTasks: number = 0;
                    let numberOfSolves: number = 0;
                    Object.values(labInDB.details).map((unit: any) => {
                      UnitModel.findOne({ _id: unit._id })
                        .populate("tasks")
                        .exec((err: any, unitInDB: any) => {
                          if (err) {
                            return response.status(INTERNAL_SERVER_ERROR).json({
                              message: "An error occurred. Please try again.",
                            });
                          } else if (!unitInDB) {
                            return response.status(NOT_FOUND).json({
                              message:
                                "Unable to find a matching unit with the specified ID.",
                            });
                          } else {
                            numberOfTasks = unitInDB.tasks.length;
                            Object.values(unitInDB.tasks).map((task: any) => {
                              TaskModel.findOne(
                                { _id: task._id },
                                (err: any, taskInDB: any) => {
                                  if (err) {
                                    return response
                                      .status(INTERNAL_SERVER_ERROR)
                                      .json({
                                        message:
                                          "An error occurred. Please try again.",
                                      });
                                  } else if (!taskInDB) {
                                    return response.status(NOT_FOUND).json({
                                      message:
                                        "Unable to find a matching task with the specified ID.",
                                    });
                                  } else {
                                    Object.values(taskInDB.solvedBy).map(
                                      (solve: any) => {
                                        if (
                                          solve.toString() ===
                                          userInDB._id.toString()
                                        ) {
                                          numberOfSolves += 1;
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            });
                          }
                        });
                    });
                    setTimeout(() => {
                      const message: any = {
                        completed:
                          numberOfTasks === numberOfSolves ? true : false,
                      };
                      if (numberOfTasks === numberOfSolves) {
                        const data: any = {
                          ID: labInDB.ID,
                          name: labInDB.name,
                        };
                        userInDB.completedRooms.push(data);
                        userInDB.save((err: any) => {
                          if (err) {
                            return response.status(INTERNAL_SERVER_ERROR).json({
                              message: "An error occured. Please try again.",
                            });
                          } else {
                            return response.status(OK).json({
                              message: message,
                            });
                          }
                        });
                      } else {
                        return response.status(OK).json({
                          message: message,
                        });
                      }
                    }, 2000);
                  }
                });
            }
          }
        }
      );
    }
  },

  getPopularLabs: (request: Request, response: Response) => {
    LabModel.find({}, (err: any, labs: any) => {
      if (err) {
        return response
          .status(INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      } else {
        let dataToSend: any = [];
        Object.values(labs).map((lab: any) => {
          const data = {
            ID: lab.ID,
            name: lab.name,
            description: lab.description,
            category: lab.category,
            tags: lab.tags,
            image: lab.labImage,
          };
          dataToSend.push(data);
        });
        return response.status(OK).json(dataToSend);
      }
    });
  },

  getRecentLabs: (request: Request, response: Response) => {
    LabModel.find({}, (err: any, labs: any) => {
      if (err) {
        return response
          .status(INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      } else {
        let dataToSend: any = [];
        Object.values(labs).map((lab: any) => {
          const data = {
            ID: lab.ID,
            name: lab.name,
            description: lab.description,
            category: lab.category,
            tags: lab.tags,
            image: lab.labImage,
          };
          dataToSend.push(data);
        });
        return response.status(OK).json(dataToSend);
      }
    });
  },

  getUserCompletedRooms: (
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
            return response.status(INTERNAL_SERVER_ERROR).json({
              message: "An error occurred. Please try again.",
            });
          } else if (!userInDB) {
            return response.status(UNAUTHORIZED).json({
              message: "Unauthorized. Kindly login to continue.",
            });
          } else {
            return response.status(OK).json(userInDB.completedRooms);
          }
        }
      );
    }
  },

  // getUserPendingRooms: (request: IGetUserAuthInfoRequest | any, response: Response) => {
  //   const user = request.user;
  //   if (!user) {
  //     return response.status(UNAUTHORIZED).json({ message: "Unauthorized. Kindly login to continue." });
  //   } else {
  //     UserModel.findOne({ username: sanitize(user.username) }, (err: any, userInDB: any) => {
  //       if (err) {
  //         return response.status(INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again." });
  //       } else if (!userInDB) {
  //         return response.status(UNAUTHORIZED).json({ message: "Unauthorized. Kindlly login to continue." });
  //       } else {
  //         let pendingRooms: any = [];
  //         LabModel.find({}, (err: any, labsInDB: any) => {
  //           if (err) {
  //             return response.status(INTERNAL_SERVER_ERROR).json({
  //               message: "An error occurred. Please try again."
  //             });
  //           } else {
  //             let labs: any = [];
  //             Object.values(labsInDB).map((labInDB: any) => {
  //               labs.push(labInDB.ID);
  //             });
  //             Object.values(userInDB.completedRooms).map((completedRoom: any) => {
  //               if (labs.includes(completedRoom)) {

  //               }
  //             });
  //           }
  //         });
  //       }
  //     });
  //   }
  // }
};
