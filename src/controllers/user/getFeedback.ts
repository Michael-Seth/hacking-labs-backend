import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { FeedbackModel } from "../../models/feedback/feedback.model";

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, UNAUTHORIZED } =
  StatusCodes;

export const CreateFeedback = {
  createFeedback: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to proceed." });
    } else {
      const { feedbackFromUser } = request.body;
      if (!feedbackFromUser) {
        return response
          .status(BAD_REQUEST)
          .json({ message: "Required field(s) missing." });
      } else {
        const feedback = new FeedbackModel({
          username: user.username,
          message: feedbackFromUser.message,
        });

        feedback.save((err: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: err.message });
          } else {
            return response
              .status(CREATED)
              .json({ message: "Your feedback has been received." });
          }
        });
      }
    }
  },
};
