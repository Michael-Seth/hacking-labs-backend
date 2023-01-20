import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { UserModel } from "../../models/user/user.model";

const { INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const LeaderBoard = {
  getLeaderBoard: (_: Request, response: Response) => {
    UserModel.find({}, (err: any, usersInDB: any) => {
      if (err) {
        return response
          .status(INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      } else {
        let dataToSend: any = [];
        Object.values(usersInDB).map((userInDB: any) => {
          if (userInDB.points > 0) {
            const data: any = {
              username: userInDB.username,
              points: userInDB.points,
            };
            dataToSend.push(data);
          }
        });

        return response.status(OK).json(dataToSend);
      }
    })
      .sort({ points: -1 })
      .limit(50);
  },
};
