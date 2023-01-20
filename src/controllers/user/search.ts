import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { LabModel } from "../../models/lab/lab.model";

const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;

export const Search = {
  searchLabs: (request: Request, response: Response) => {
    const { query } = request.body;
    if (!query) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "Required field(s) missing." });
    } else {
      LabModel.find({ name: { $regex: sanitize(query), $options: "i" }}, (err: any, results: any) => {
        if (err) {
            console.log(err);
          return response
            .status(INTERNAL_SERVER_ERROR)
            .json({ message: "An error occurred. Please try again later." });
        } else {
          return response.status(OK).json(results);
        }
      });
    }
  },
};
