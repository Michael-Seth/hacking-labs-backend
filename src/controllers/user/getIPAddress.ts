import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
const superagent = require("superagent");

interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { OK, UNAUTHORIZED, SERVICE_UNAVAILABLE } = StatusCodes;

export const GetIPAddress = {
  getIPAddress: (
    request: IGetUserAuthInfoRequest | any,
    response: Response
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Please login to continue." });
    } else {
      superagent
        .post(`${process.env.OPENVPN_SERVER_ADDRESS}/user/getIPAddress`)
        .send({ username: `${user.username}` })
        .set("Content-Type", "application/json")
        .set("accept", "json")
        .end((err: any, res: any) => {
          if (err) {
            return response
              .status(SERVICE_UNAVAILABLE)
              .json({ message: "An error occured. Please try again." });
          } else {
            return response.status(OK).json({ ipaddress: res.text });
          }
        });
    }
  },
};
