import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { NewsLetterModel } from "../../models/newsletter/newsletter.model";

const { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } = StatusCodes;

export const JoinNewsLetter = {
  join: (request: Request, response: Response) => {
    const { email } = request.body;

    if (!email) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "Required field(s) missing." });
    } else {
      const newNewsLetterUser = new NewsLetterModel({
        email: email,
      });

      newNewsLetterUser.save((err: any) => {
        if (err) {
          return response
            .status(INTERNAL_SERVER_ERROR)
            .json({ message: err.message });
        } else {
          return response
            .status(CREATED)
            .json({ message: "You have been added to our newsletter list." });
        }
      });
    }
  },
};
