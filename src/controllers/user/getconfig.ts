import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
const superagent = require("superagent");

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, SERVICE_UNAVAILABLE } =
  StatusCodes;

import { UserModel } from "../../models/user/user.model";

export const GetConfig = {
  getConfig: (req: IGetUserAuthInfoRequest | any, res: Response) => {
    const user = req.user;
    if (!user) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to continue." });
    } else {
      UserModel.findOne({ username: user.username }, (err: any, user: any) => {
        if (err) {
          return res.status(INTERNAL_SERVER_ERROR).send(err.message);
        } else if (!user) {
          return res
            .status(UNAUTHORIZED)
            .json({ message: "Unauthorized. Kindly login to continue." });
        } else {
          superagent
            .post(`${process.env.OPENVPN_SERVER_ADDRESS}/user/getconfigfile`)
            .send({ username: `${user.username}` })
            .set("Content-Type", "application/json")
            .set("accept", "json")
            .end((err: any, response: any) => {
              if (err) {
                return res
                  .status(SERVICE_UNAVAILABLE)
                  .json({ error: err.text });
              } else {
                const resp = JSON.parse(response.text);
                const filecontent = resp.filecontent;
                const filename = resp.filename;
                const filetype = "text/plain";

                res.writeHead(OK, {
                  "Content-Disposition": `attachment: filename="${filename}"`,
                  "Content-Type": filetype,
                });

                const download = Buffer.from(filecontent, "base64");
                return res.status(OK).end(download);
              }
            });
        }
      });
    }
  },
};
