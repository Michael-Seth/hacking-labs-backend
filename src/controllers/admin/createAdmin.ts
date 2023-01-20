import { Request,  Response } from "express";
import StatusCodes from "http-status-codes";
import { ParamMissingError } from "../../shared/errors";
import { sanitize } from "sanitizer";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as mailer from "nodemailer";

import { UserModel } from "../../models/user/user.model";
import { TokenModel } from "../../models/token/token.model";


const { BAD_REQUEST, CREATED, FORBIDDEN, INTERNAL_SERVER_ERROR, UNAUTHORIZED } =
  StatusCodes;

export const createAdmin = {
  
create: async (
  request: Request,
  response: Response
) => {
  try {
    const { user } = request.body;
    
    if (!user) {
      throw new ParamMissingError()
      return
    }
    
    if (!user.email || !user.username || !user.password) {
      return response
      .status(BAD_REQUEST)
      .send("One of the required fields is missing.");
    }
    
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const newUser = new UserModel({
      email: user.email,
      username: sanitize(user.username),
      firstname: sanitize(user.firstname),
      lastname: sanitize(user.lastname),
      career_path: sanitize(user.career_path),
      role: "admin",
      password: hashedPassword,
    });
    
    newUser.save((err: Error | any) => {
      if (err) {
        if (err.code === 11000) {
          return response.status(INTERNAL_SERVER_ERROR).json({
            message: "A user with the specified email already exists.",
          });
        } else {
          return response.status(INTERNAL_SERVER_ERROR).json({ message: err });
        }
      } else {
        let token = new TokenModel({
          token: crypto.randomBytes(30).toString("hex"),
        });
        token._userID.push(newUser._id);
        token.save((err: any) => {
          if (err) {
            console.log(request);
            
            return response.status(INTERNAL_SERVER_ERROR).json({
                  message:
                    "An error occured while generating verification tokens. Please try again.",
                });
              } else {
                let transporter = mailer.createTransport({
                  host: "smtp.zoho.com",
                  port: 465,
                  secure: true,
                //   name: "cysec.ng",
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
                    console.log(err);
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message:
                        "An error occurred while sending verification mail.",
                    });
                  } else {
                    return response.status(CREATED).json({
                      message:
                        "Registration complete. Please check your email to verify your account.",
                    });
                  }
                });
              }
            });
          }
        });
  } catch (error) {
      console.log(error)
       return response.status(INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Erro' });
  }
}


}