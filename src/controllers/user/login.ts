import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { sanitize } from "sanitizer";

require("dotenv").config();
interface JwtPayload {
  username: string;
}
import { UserModel } from "../../models/user/user.model";
import { RefreshTokenModel } from "../../models/refreshToken/refreshTokenModel";
import { ParamMissingError } from "../../shared/errors";

const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = StatusCodes;
const refreshSecret: any = process.env.JWT_SECRET;
const accessSecret: any = process.env.ACCESS_SECRET;
export const Login = {
  loginUser: async (req: Request, res: Response) => {
    const { user } = req.body;
    if (!user) {
      throw new ParamMissingError();
    }
    if (!user.username || !user.password) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "Required fields are missing. Please try again." });
    }

    const User = await UserModel.findOne({
      username: sanitize(user.username),
    }).exec();

    if (!User) {
      return res.status(UNAUTHORIZED).json({
        message: "Incorrect username/email or password",
      });
    }

    if (!bcrypt.compareSync(user.password, User.password)) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "Incorrect username/email or password." });
    }
    if (!User.isVerified) {
      return res.status(UNAUTHORIZED).json({
        message:
          "Your account has not been verified. Please do so in order to proceed.",
      });
    }

    const username = sanitize(User.username);
    let expirationTime: any = 0;
    if (user.rememberMe) {
      expirationTime = 2.592e6;
    } else {
      expirationTime = 86400;
    }
    let newTokenArray = User.refreshToken;

    const refreshToken = jwt.sign(
      {
        username,
      },
      refreshSecret,
      {
        algorithm: "HS256",
        expiresIn: expirationTime,
      }
    );
    if (req.cookies.accessToken || req.cookies.refreshToken) {
      const accessToken = jwt.verify(req.cookies.accessToken, accessSecret);
      const refreshToken = jwt.verify(req.cookies.refreshToken, refreshSecret);

      if (accessToken || refreshToken) {
        res.cookie("refreshToken", "", { maxAge: 0 });
        res.clearCookie("refreshToken");
        return res
          .status(406)
          .json({ message: "unauthorized, please try again" });
      }
    }

    User.refreshToken = [...newTokenArray, refreshToken];
    await User.save();

    const newRefreshToken = new RefreshTokenModel({
      _userID: User._id,
      token:refreshToken
    })
   await newRefreshToken.save()
    const token = jwt.sign({ username: User.username }, accessSecret, {
      expiresIn: "30s",
    });

    const data = {
      token: token,
    };

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 24 * 3600,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res.status(OK).json(data);
  },

  logout: (req: Request, res: Response) => {
    try {
      res.cookie("refreshToken", "", { maxAge: 0 });
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "logged out" });
    } catch (error) {
      console.log(error);
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const cookies = req.cookies;
      if (cookies.refreshToken === null) return res.status(401).json({ message: "invalid access" });

      const refreshToken = await RefreshTokenModel.findOne({ token: cookies.refreshToken })
      
      if (!refreshToken) {
        return res.status(403).json({ message: "invalid refresh token" })
      }

      const refresh = jwt.verify(
        cookies.refreshToken,
        refreshSecret
      ) as JwtPayload;
      const user = await UserModel.findOne({
        username: refresh.username,
      }).exec();

      if (!user) {
        return res.status(403).json({ message: "you are not authorized here" });
      }
      const accessToken = jwt.sign({ username: user.username }, accessSecret, {
        expiresIn: "1h",
      });

      const data = {
        token: accessToken,
      };

      return res.status(200).json(data);
    } catch (error) {
      console.log(error.name);
      if (error.name === "TokenExpiredError") {
        res.status(400).json({ message: "invalid token please login" });
      }
    }
  },
};
