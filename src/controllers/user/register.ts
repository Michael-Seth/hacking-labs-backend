import { Request, response, Response } from "express";
import StatusCodes from "http-status-codes";
import { ParamMissingError } from "../../shared/errors";
import { sanitize } from "sanitizer";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as mailer from "nodemailer";

import { UserModel } from "../../models/user/user.model";
import { TokenModel } from "../../models/token/token.model";

const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const Register = {
  createUser: async (req: Request, res: Response) => {
    const { user } = req.body;
  
    if (!user) {
      throw new ParamMissingError();
    } else {
      if (!user.email || !user.username || !user.password) {
        return res
          .status(BAD_REQUEST)
          .send("One of the required fields is missing.");
      } else {
        const hashedPassword = await bcrypt.hashSync(user.password, 10);
        const newUser = new UserModel({
          email: user.email,
          username: sanitize(user.username),
          firstname: sanitize(user.firstname),
          lastname: sanitize(user.lastname),
          career_path: sanitize(user.career_path),
          password: hashedPassword,
        });

        newUser.save((err: Error | any) => {
          if (err) {
            if (err.code === 11000) {
              return res.status(INTERNAL_SERVER_ERROR).json({
                message: "A user with the specified email already exists.",
              });
            } else {
              return res.status(INTERNAL_SERVER_ERROR).json({ message: err });
            }
          } else {
            let token = new TokenModel({
              token: crypto.randomBytes(30).toString("hex"),
            });
            token._userID.push(newUser._id);
            token.save((err: any) => {
              if (err) {
                console.log(err)
                return res.status(INTERNAL_SERVER_ERROR).json({
                  message:
                    "An error occured while generating verification tokens. Please try again.",
                });
              } else {
                let transporter = mailer.createTransport({
                  host: "smtp.zoho.com",
                  port: 465,
                  secure: true,
                  name: "cysec.ng",
                  auth: {
                    user: `${process.env.SENDER_MAIL}`,
                    pass: `${process.env.SENDER_PASSWORD}`,
                  },
                });
                let mailOptions = {
                  from: "fiscalautonomy@zohomail.com",
                  to: newUser.email,
                  subject: "Welcome to CYSEC NG LABS",
                  html: `<p>To finalize your registration, please copy this token and paste in the required field (<a href="https://labs.cysec.ng/verify">here</a>): ${token.token}</p>`,
                };

                transporter.sendMail(mailOptions, (err: any) => {
                  if (err) {
                    console.log(err)
                    return res.status(INTERNAL_SERVER_ERROR).json({
                      message:
                        "An error occurred while sending verification mail.",
                    });
                  } else {
                    return res.status(CREATED).json({
                      message:
                        "Registration complete. Please check your email to verify your account.",
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  },

  requestToken: (request: Request, response: Response) => {
    const { requestData } = request.body;
    if (!requestData) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "One or more required field(s) missing." });
    } else {
      UserModel.findOne(
        { email: sanitize(requestData.email) },
        (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred." });
          } else if (!userInDB) {
            return response.status(OK).json({
              message:
                "A verification token has been sent to your email address.",
            });
          } else {
            if (userInDB.isVerified) {
              return response
                .status(BAD_REQUEST)
                .json({ message: "Your account has already been verified." });
            } else {
              let token = new TokenModel({
                token: crypto.randomBytes(30).toString("hex"),
              });
              token._userID.push(userInDB._id);
              token.save((err: any) => {
                if (err) {
                  console.log(err)
                  return response.status(INTERNAL_SERVER_ERROR).json({
                    message:
                      "An error occured while generating verification tokens. Please try again.",
                  });
                } else {
                  let transporter = mailer.createTransport({
                    host: "smtm.zoho.com",
                    port: 465,
                    secure: true,
                    // name: "cysec.ng",
                    auth: {
                      user: `${process.env.SENDER_MAIL}`,
                      pass: `${process.env.SENDER_PASSWORD}`,
                    },
                  });
                  let mailOptions = {
                    from: "fiscalautonomy@zohomail.com",
                    to: userInDB.email,
                    subject: "Welcome to CYSEC NG LABS",
                    html: `<p>To finalize your registration, please copy this token and paste in the required field (<a href="https://labs.cysec.ng/verify">here</a>): ${token.token}</p>`,
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
                          "A verification token has been sent to your email address.",
                      });
                    }
                  });
                }
              });
            }
          }
        }
      );
    }
  },

  verifyToken: (request: Request, response: Response) => {
    const { verifyData } = request.body;
    if (!verifyData) {
      return response
        .status(BAD_REQUEST)
        .json({ message: "One or more required field(s) missing." });
    } else {
      TokenModel.findOne(
        { token: sanitize(verifyData.token) },
        (err: any, tokenInDB: any) => {
          if (err) {
            return response.status(INTERNAL_SERVER_ERROR).json({
              message:
                "An error occurred while processing request. Please try again later.",
            });
          } else if (!tokenInDB) {
            return response.status(BAD_REQUEST).json({
              message:
                "We could not recognize the token you provided. It may be wrong or it has expired.",
            });
          } else {
            UserModel.findOne(
              { _id: tokenInDB._userID[0] },
              (err: any, userInDB: any) => {
                if (err) {
                  return response.status(INTERNAL_SERVER_ERROR).json({
                    message: "An errror occurred. Please try again later.",
                  });
                } else if (!userInDB) {
                  return response.status(BAD_REQUEST).json({
                    message:
                      "We encountered an error while processing your request.",
                  });
                } else {
                  if (userInDB.isVerified) {
                    return response.status(BAD_REQUEST).json({
                      message: "Your account has already been verified.",
                    });
                  } else {
                    userInDB.updateOne({ isVerified: true }, (err: any) => {
                      if (err) {
                        return response.status(INTERNAL_SERVER_ERROR).json({
                          message:
                            "An error occurred while processing request. Please try again.",
                        });
                      } else {
                        tokenInDB.deleteOne((err: any) => {
                          if (err) {
                            return response
                              .status(INTERNAL_SERVER_ERROR)
                              .json({
                                message: "An error occurred. Please try again.",
                              });
                          } else {
                            return response.status(OK).json({
                              message:
                                "Verification successful. Please proceed to login.",
                            });
                          }
                        });
                      }
                    });
                  }
                }
              }
            );
          }
        }
      );
    }
  },
};
