import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";
import * as mailer from "nodemailer";

import { UserModel } from "../../models/user/user.model";
import { TokenModel } from "../../models/token/token.model";

const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, CREATED } = StatusCodes;

export const ResetPassword = {
  reset: (request: Request, response: Response) => {
    const { email } = request.body;
    if (!email) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "One or more required field(s) missing." });
    } else {
      UserModel.findOne(
        { email: sanitize(email) },
        (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred. Please try again later." });
          } else if (!userInDB) {
            return response.status(OK).json({
              message:
                "You will receive a reset token if your email exists in our database.",
            });
          } else {
            let _token = new TokenModel({
              token: crypto.randomBytes(30).toString("hex"),
              tokenType: "reset",
            });
            _token._userID.push(userInDB._id);
            _token.save((err: any) => {
              if (err) {
                return response.status(INTERNAL_SERVER_ERROR).json({
                  message:
                    "An error occurred while sending token. Please try again.",
                });
              } else {
                let transporter = mailer.createTransport({
                  host: "smtp.zoho.com",
                  port: 465,
                  secure: true,
                  // name: "cysec.ng",
                  auth: {
                    user: `${process.env.SENDER_MAIL}`,
                    pass: `${process.env.SENDER_PASSWORD}`,
                  },
                });
                let mailOptions = {
                  from: "labs@cysec.ng",
                  to: userInDB.email,
                  subject: "CYSEC NG LABS - Reset Password",
                  html: `Hi ${userInDB.username},<br><p>To reset your password, please copy this token and paste in the required field (<a href="https://labs.cysec.ng/reset">here</a>): ${_token.token}</p>`,
                };

                transporter.sendMail(mailOptions, (err: any) => {
                  if (err) {
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message:
                        "An error occurred while sending verification mail.",
                    });
                  } else {
                    return response.status(CREATED).json({
                      message:
                        "You will receive a reset token if your email exists in our database.",
                    });
                  }
                });
              }
            });
          }
        }
      );
    }
  },

  verifyResetToken: (request: Request, response: Response) => {
    const { resetData } = request.body;
    if (!resetData) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "Required field(s) missing." });
    } else {
      TokenModel.findOne(
        { token: sanitize(resetData.token), tokenType: "reset" },
        (err: any, tokenInDB: any) => {
          if (err) {
            return response.status(INTERNAL_SERVER_ERROR).json({
              message: "An error occured while processing your request.",
            });
          } else if (!tokenInDB) {
            return response.status(BAD_REQUEST).json({
              message:
                "The token provided was not found. It might have expired.",
            });
          } else {
            UserModel.findOne(
              { _id: tokenInDB._userID },
              async (err: any, userInDB: any) => {
                if (err) {
                  return response.status(INTERNAL_SERVER_ERROR).json({
                    message: "An error occured while processing your request.",
                  });
                } else if (!userInDB) {
                  return response.status(BAD_REQUEST).json({
                    message:
                      "The token provided was not found. It might have expired.",
                  });
                } else {
                  const newPassword = await bcrypt.hashSync(
                    resetData.password,
                    10
                  );
                  userInDB.updateOne({ password: newPassword }, (err: any) => {
                    if (err) {
                      return response
                        .status(INTERNAL_SERVER_ERROR)
                        .json({ message: "An error occurred." });
                    } else {
                      tokenInDB.deleteOne((err: any) => {
                        if (err) {
                          return response
                            .status(INTERNAL_SERVER_ERROR)
                            .json({ message: "An error occurred." });
                        } else {
                          return response
                            .status(CREATED)
                            .json({
                              message: "Password updated successfully.",
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
      );
    }
  },
};
