import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { UserModel } from "../../models/user/user.model";
import { LabModel } from "../../models/lab/lab.model";
import { UnitModel } from "../../models/lab/details/unit/unit.model";
import { TaskModel } from "../../models/lab/details/task/task.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const {
  OK,
  NO_CONTENT,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} = StatusCodes;

export const CreateLab = {
  createLab: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(NOT_FOUND)
              .json({ message: "User not found. Please login." });
          } else {
            if (userInDB.role !== "admin") {
              return response.status(UNAUTHORIZED).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { labInfo } = request.body;

              if (!labInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing" });
              } else {
                //create lab
                const newLab = new LabModel({
                  ID: sanitize(labInfo.name.replace(/\s+/g, "-").toLowerCase()),
                  name: sanitize(labInfo.name),
                  description: sanitize(labInfo.description),
                  category: sanitize(labInfo.category),
                  tags: labInfo.tags,
                  machineInfo: labInfo.machineInfo,
                  path: labInfo.path,
                  labImage: labInfo.image,
                });
                newLab.save((err: any) => {
                  if (err) {
                    console.log(err);
                    
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message: "An error occurred. Please try again.yy",
                    });
                  } else {
                    return response.status(OK).json({
                      message: `Lab added successfully with id: ${newLab.ID}`,
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

  editLab: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response.status(UNAUTHORIZED).json({
        message: "Unauthorized. Kindly login to continue.",
      });
    } else {
      UserModel.findOne(
        { username: sanitize(user.username) },
        (err: any, userInDB: any) => {
          if (err) {
            return response.status(INTERNAL_SERVER_ERROR).json({
              message: "An error occured. Please try again.",
            });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            if (userInDB.role !== "admin") {
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to carry out this operation.",
              });
            } else {
              const { labInfo } = request.body;
              if (!labInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing." });
              } else {
                LabModel.findOne(
                  { ID: sanitize(labInfo.labID) },
                  (err: any, labInDB: any) => {
                    if (err) {
                      return response.status(INTERNAL_SERVER_ERROR).json({
                        message: "An error occurred. Please try again.",
                      });
                    } else if (!labInDB) {
                      return response.status(NOT_FOUND).json({
                        message:
                          "Unable to find a matching lab with the given ID.",
                      });
                    } else {
                      const dataToUpdate: any = {
                        ID:
                          labInfo.name !== null && labInfo.name !== undefined
                            ? sanitize(
                                labInfo.name.replace(/\s+/g, "-").toLowerCase()
                              )
                            : labInDB.ID,
                        name:
                          labInfo.name !== null && labInfo.name !== undefined
                            ? sanitize(labInfo.name)
                            : labInDB.name,
                        description:
                          labInfo.description !== null &&
                          labInfo.description !== undefined
                            ? sanitize(labInfo.description)
                            : labInDB.description,
                        category:
                          labInfo.category !== null &&
                          labInfo.category !== undefined
                            ? sanitize(labInfo.category)
                            : labInDB.category,
                        tags:
                          labInfo.tags !== null && labInfo.tags !== undefined
                            ? labInfo.tags
                            : labInDB.tags,
                        machineInfo:
                          labInfo.machineInfo !== null &&
                          labInfo.machineInfo !== undefined
                            ? labInfo.machineInfo
                            : labInDB.machineInfo,
                        path:
                          labInfo.path !== null && labInfo.path !== undefined
                            ? sanitize(labInfo.path)
                            : labInDB.path,
                      };
                      labInDB.updateOne(dataToUpdate, (err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message: "An error occurred. Please try again.",
                          });
                        } else {
                          return response
                            .status(OK)
                            .json({ message: "Update successful" });
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
  },

  deleteLab: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
            if (userInDB.role !== "admin") {
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { labData } = request.body;
              if (!labData) {
                return response.status(BAD_REQUEST).json({
                  message: "Required field(s) missing",
                });
              } else {
                LabModel.findOne(
                  { ID: sanitize(labData.labID) },
                  (err: any, labInDB: any) => {
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
                      labInDB.deleteOne((err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message: "An error occurred. Please try again.",
                          });
                        } else {
                          return response.status(OK).json({
                            message: "Lab deleted successfully.",
                          });
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
  },

  createUnit: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            if (userInDB.role !== "admin") {
              return response.status(UNAUTHORIZED).json({
                message: "You are not authorized to carry out this operation.",
              });
            } else {
              const { labID } = request.params;
              const { unitInfo } = request.body;
              if (!unitInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing." });
              } else {
                if (!labID) {
                  return response
                    .status(BAD_REQUEST)
                    .json({ message: "Required field(s) missing. " });
                } else {
                  LabModel.findOne(
                    { _id: sanitize(labID) },
                    (err: any, lab: any) => {
                      if (err) {
                        return response.status(INTERNAL_SERVER_ERROR).json({
                          message: "An error occured. Please try again.",
                        });
                      } else {
                        if (!lab) {
                          return response
                            .status(NOT_FOUND)
                            .json({ message: "Lab ID not found." });
                        } else {
                          unitInfo.tasks = unitInfo.tasks || [];
                          const newUnit = new UnitModel({
                            heading: sanitize(unitInfo.heading),
                            description: sanitize(unitInfo.description),
                            unitNumber: lab.details.length + 1
                          });
                          Object.values(unitInfo.tasks).map((task: any) => {
                            const newTask = new TaskModel({
                              question: sanitize(task.question),
                              answer: task.answer,
                              isAnswerRequired: task.isAnswerRequired,
                              isCaseSensitive: task.isCaseSensitive,
                            });
                            newTask.save((err: any) => {
                              if (err) {
                                return response
                                  .status(INTERNAL_SERVER_ERROR)
                                  .json({
                                    message:
                                      "An error occured. Please try again.",
                                  });
                              } else {
                                newUnit.tasks.push(newTask._id);
                              }
                            });
                          });
                          setTimeout(() => {
                            newUnit.save((err: any) => {
                              if (err) {
                                return response
                                  .status(INTERNAL_SERVER_ERROR)
                                  .json({
                                    message:
                                      "An error occured. Please try again.",
                                  });
                              } else {
                                lab.details.push(newUnit._id);
                                lab.save((err: any) => {
                                  if (err) {
                                    return response
                                      .status(INTERNAL_SERVER_ERROR)
                                      .json({
                                        message:
                                          "An error occurred. Please try again.",
                                      });
                                  } else {
                                    return response.status(OK).json({
                                      message: "Unit added successfully",
                                    });
                                  }
                                });
                              }
                            });
                          }, 1000);
                        }
                      }
                    }
                  );
                }
              }
            }
          }
        }
      );
    }
  },

  editUnit: (request: IGetUserAuthInfoRequest | any, response: any) => {
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
            if (userInDB.role !== "admin") {
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { unitInfo } = request.body;
              if (!unitInfo) {
                return response.status(BAD_REQUEST).json({
                  message: "Required field(s) missing.",
                });
              } else {
                UnitModel.findOne(
                  { _id: sanitize(unitInfo.unitID) },
                  (err: any, unitInDB: any) => {
                    if (err) {
                      return response.status(INTERNAL_SERVER_ERROR).json({
                        message: "An error occurred. Please try again.",
                      });
                    } else if (!unitInDB) {
                      return response.status(NOT_FOUND).json({
                        message:
                          "Unable to find a section with the specified ID.",
                      });
                    } else {
                      const dataToUpdate: any = {
                        heading:
                          unitInfo.heading !== null &&
                          unitInfo.heading !== undefined
                            ? sanitize(unitInfo.heading)
                            : unitInDB.heading,
                        description:
                          unitInfo.description !== null &&
                          unitInfo.description !== undefined
                            ? sanitize(unitInfo.description)
                            : unitInDB.description,
                      };

                      unitInDB.updateOne(dataToUpdate, (err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message: "An error occurred. Please try again.",
                          });
                        } else {
                          return response.status(OK).json({
                            message: "Update successful.",
                          });
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
  },

  deleteUnit: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
            if (userInDB.role !== "admin") {
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { unitInfo } = request.body;
              if (!unitInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing." });
              } else {
                UnitModel.findOne(
                  { _id: sanitize(unitInfo.unitID) },
                  (err: any, unitInDB: any) => {
                    if (err) {
                      return response.status(INTERNAL_SERVER_ERROR).json({
                        message: "An error occurred. Please try again.",
                      });
                    } else if (!unitInDB) {
                      return response.status(NOT_FOUND).json({
                        message:
                          "Unable to find a section with the specified ID.",
                      });
                    } else {
                      unitInDB.deleteOne((err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message: "An error occurred. Please try again.",
                          });
                        } else {
                          return response.status(OK).json({
                            message: "Unit deleted successfully.",
                          });
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
  },

  createTask: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
              .json({ message: "An error occured. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            if (userInDB.role !== "admin") {
              return response.status(UNAUTHORIZED).json({
                message: "You are not authorized to carry out this operation",
              });
            } else {
              const { unitID } = request.params;
              const { taskInfo } = request.body;
              if (!taskInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) missing." });
              } else {
                if (!unitID) {
                  return response
                    .status(BAD_REQUEST)
                    .json({ message: "Required field(s) missing." });
                } else {
                  UnitModel.findOne(
                    { _id: sanitize(unitID) },
                    (err: any, unit: any) => {
                      if (err) {
                        return response.status(INTERNAL_SERVER_ERROR).json({
                          message: "An error occurred. Please try again.",
                        });
                      } else if (!unit) {
                        return response
                          .status(NOT_FOUND)
                          .json({ message: "Unit not found." });
                      } else {
                        const newTask = new TaskModel({
                          question: sanitize(taskInfo.question),
                          answer: sanitize(taskInfo.answer),
                          isAnswerRequired: taskInfo.isAnswerRequired,
                          isCaseSensitive: taskInfo.isCaseSensitive,
                        });
                        newTask.save((err: any) => {
                          if (err) {
                            return response.status(INTERNAL_SERVER_ERROR).json({
                              message: "An error occurred. Please try again.",
                            });
                          } else {
                            unit.tasks.push(newTask._id);
                            unit.save((err: any) => {
                              if (err) {
                                return response
                                  .status(INTERNAL_SERVER_ERROR)
                                  .json({
                                    message:
                                      "An error occured. Please try again.",
                                  });
                              } else {
                                LabModel.findOne({ ID: sanitize(taskInfo.labID) }, (err: any, labInDB: any) => {
                                  if (err) {
                                    return response.status(INTERNAL_SERVER_ERROR).json({
                                      message: "An error occurred. Please try again."
                                    });
                                  } else if (!labInDB) {
                                    return response.status(NOT_FOUND).json({
                                      message: "Unable to find a matching lab with the specified ID."
                                    });
                                  } else {
                                    labInDB.updateOne({ totalPoints: labInDB.totalPoints + 50 }, (err: any) => {
                                      if (err) {
                                        return response.status(INTERNAL_SERVER_ERROR).json({
                                          message: "An error occurred. Please try again."
                                        });
                                      } else {
                                        return response.status(OK).json({
                                          message: "Task added successfully.",
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    }
                  );
                }
              }
            }
          }
        }
      );
    }
  },

  editTask: (request: IGetUserAuthInfoRequest | any, response: Response) => {
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
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { taskInfo } = request.body;
              if (!taskInfo) {
                return response
                  .status(BAD_REQUEST)
                  .json({ message: "Required field(s) is missing." });
              } else {
                if (taskInfo.ID) {
                  TaskModel.findOne(
                    { _id: sanitize(taskInfo.ID) },
                    (err: any, taskInDB: any) => {
                      if (err) {
                        return response.status(INTERNAL_SERVER_ERROR).json({
                          message: "An error occurred. Please try again later.",
                        });
                      } else if (!taskInDB) {
                        return response.status(NOT_FOUND).json({
                          message:
                            "Unable to find a matching task with the provided ID.",
                        });
                      } else {
                        const toUpdate = {
                          question:
                            taskInfo.question !== null &&
                            taskInfo.question !== undefined
                              ? taskInfo.question
                              : taskInDB.question,
                          answer:
                            taskInfo.answer !== null &&
                            taskInfo.answer !== undefined
                              ? taskInfo.answer
                              : taskInDB.answer,
                          isCaseSensitive:
                            taskInfo.isCaseSensitive !== null &&
                            taskInfo.isCaseSensitive !== undefined
                              ? taskInfo.isCaseSensitive
                              : taskInDB.isCaseSensitive,
                          isAnswerRequired:
                            taskInfo.isAnswerRequired !== null &&
                            taskInfo.isAnswerRequired !== undefined
                              ? taskInfo.isAnswerRequired
                              : taskInDB.isAnswerRequired,
                        };

                        taskInDB.updateOne(toUpdate, (err: any) => {
                          if (err) {
                            return response.status(INTERNAL_SERVER_ERROR).json({
                              message:
                                "An error occurred while updating task information.",
                            });
                          } else {
                            return response.status(NO_CONTENT).json({
                              message: "Task information updated successfully.",
                            });
                          }
                        });
                      }
                    }
                  );
                } else {
                  return response
                    .status(BAD_REQUEST)
                    .json({ message: "Required field(s) is missing." });
                }
              }
            }
          }
        }
      );
    }
  },

  deleteTask: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response.status(UNAUTHORIZED).json({
        message: "Unauthorized. Kindly login to continue.",
      });
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
            if (userInDB.role !== "admin") {
              return response.status(FORBIDDEN).json({
                message: "You are not authorized to perform this operation.",
              });
            } else {
              const { taskInfo } = request.body;
              if (!taskInfo) {
                return response.status(BAD_REQUEST).json({
                  message: "Required field(s) missing.",
                });
              } else {
                TaskModel.findOne(
                  { _id: sanitize(taskInfo.taskID) },
                  (err: any, taskInDB: any) => {
                    if (err) {
                      return response.status(INTERNAL_SERVER_ERROR).json({
                        message: "An error occurred. Please try again.",
                      });
                    } else if (!taskInDB) {
                      return response.status(NOT_FOUND).json({
                        message:
                          "Unable to find a matching task with the specified ID.",
                      });
                    } else {
                      taskInDB.deleteOne((err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message: "An error occurred. Please try again.",
                          });
                        } else {
                          return response.status(OK).json({
                            message: "Task deleted successfully",
                          });
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
  },
};
