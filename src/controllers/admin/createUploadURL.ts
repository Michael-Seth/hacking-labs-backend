import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as aws from "aws-sdk";

import { UserModel } from "../../models/user/user.model";

export interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

aws.config.update({
  secretAccessKey: process.env.SECRETACCESSKEY,
  accessKeyId: process.env.ACCESSKEYID,
  region: process.env.REGION,
  signatureVersion: process.env.SIGNATUREVERSION,
});

const s3 = new aws.S3();

const { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR } =
  StatusCodes;

export const CreatePreSignedURL = {
  generate: (request: IGetUserAuthInfoRequest | any, response: Response) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to continue" });
    } else {
      UserModel.findOne(
        { username: user.username },
        (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Unauthorized. Kindly login to continue." });
          } else {
            if (userInDB.role !== "admin") {
              return response
                .status(FORBIDDEN)
                .json({
                  message: "You are not authorized to carry out this request.",
                });
            } else {
              let fileurls: any = [];

              const params = {
                Bucket: "cyseclabsdownloadable",
                Key: request.query.filename,
                Expires: 60 * 60,
                ACL: "public-read",
                ContentType: request.query.filetype,
              };

              s3.getSignedUrl(
                "putObject",
                params,
                async (err: any, url: any) => {
                  if (err) {
                    return response
                      .status(INTERNAL_SERVER_ERROR)
                      .json({
                        message: "An error occurred while generating URL.",
                      });
                  } else {
                    fileurls[0] = url;
                    const message: any = {
                      status: true,
                      message: "URL generated successfully",
                      url: fileurls,
                    };
                    return response.status(OK).json({ message: message });
                  }
                }
              );
            }
          }
        }
      );
    }
  },
};
