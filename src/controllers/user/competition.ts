import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";

import { CompetitionModel } from "../../models/competition/competition.model";

const { INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const Competition = {
  getCompetitions: (_req: Request, response: Response) => {
    CompetitionModel.find({}, (err: any, competitions: any) => {
      if (err) {
        return response
          .status(INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      } else {
        if (competitions.length >= 1) {
          return response.status(OK).json(competitions);
        } else {
          const dataToSend: any = [
            {
              name: "Hack The Planet",
              details: "Hack as much as you can",
            },
            {
              name: "CYSEC CTF 2023",
              details:
                "The biggest cyber security hacking event & competition for undergraduates in Nigeria.",
            },
            {
              name: "Attack The Attacker",
              details:
                "Attack The Attacker (ATA) is an attack/defense compeition style where you can actively hack a machine and defend it at the same time.",
            },
          ];

          return response.status(OK).json(dataToSend);
        }
      }
    });
  },
};
