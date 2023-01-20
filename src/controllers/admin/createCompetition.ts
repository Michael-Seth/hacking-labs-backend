import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { UserModel } from "../../models/user/user.model";
import { CompetitionModel } from "../../models/competition/competition.model";

export interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { BAD_REQUEST, CREATED, FORBIDDEN, INTERNAL_SERVER_ERROR, UNAUTHORIZED } =
  StatusCodes;

export const CreateCompetition = {
  create: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const { user } = request.user;
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
              .json({
                message:
                  "An error occurred while performing your request. Please try again.",
              });
          } else {
            if (!userInDB) {
              return response
                .status(UNAUTHORIZED)
                .json({ message: "Unauthorized. Kindly login to continue." });
            } else {
              if (userInDB.role !== "admin") {
                return response
                  .status(FORBIDDEN)
                  .json({
                    message:
                      "You are not authorized to carry out this operation.",
                  });
              } else {
                const { competition } = request.body;
                if (!competition) {
                  return response
                    .status(BAD_REQUEST)
                    .json({ message: "Required field(s) missing." });
                } else {
                  const _competition: any = new CompetitionModel({
                    name: competition.name,
                    details: competition.details,
                  });

                  _competition.save((err: any) => {
                    if (err) {
                      return response
                        .status(INTERNAL_SERVER_ERROR)
                        .json({ message: err.message });
                    } else {
                      return response
                        .status(CREATED)
                        .json({ message: "Competition added successfully." });
                    }
                  });
                }
              }
            }
          }
        }
      );
    }
  },
};
