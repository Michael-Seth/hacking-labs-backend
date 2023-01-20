import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sanitize } from "sanitizer";
import * as bcrypt from "bcryptjs";

import { UserModel } from "../../models/user/user.model";

export interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } =
  StatusCodes;

export const Profile = {
  update: async(request: IGetUserAuthInfoRequest | any, response: Response) => {
 try {
   const { user } = request;
   if (!user) {
     return response
       .status(UNAUTHORIZED)
       .json({ message: "Please login to continue." });
   }
   const { updateData } = request.body;
   if (!updateData) {
     return response
       .status(BAD_REQUEST)
       .json({ message: "Required field(s) missing." });
   }
   const userInDB = await UserModel.findOne({
     username: sanitize(user.username),
   });

   if (!userInDB) {
     return response
       .status(UNAUTHORIZED)
       .json({ message: "Please login to continue." });
   }

   userInDB.firstname = updateData.firstname;
   userInDB.lastname = updateData.lastname;
   userInDB.email = updateData.email;
   userInDB.save();
   return response
                     .status(CREATED)
                     .json({ message: "Profile updated successfully." });
                 
 } catch (error) {
   return response
               .status(INTERNAL_SERVER_ERROR)
               .json({ message: "An error occurred. Please try again." });
 }
   
  },

  updatePassword: (
    request: IGetUserAuthInfoRequest | any,
    response: Response
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Please login to continue." });
    } else {
      UserModel.findOne(
        { username: sanitize(user.username) },
        async (err: any, userInDB: any) => {
          if (err) {
            return response
              .status(INTERNAL_SERVER_ERROR)
              .json({ message: "An error occurred. Please try again." });
          } else if (!userInDB) {
            return response
              .status(UNAUTHORIZED)
              .json({ message: "Please login to continue." });
          } else {
            const { passwordData } = request.body;
            if (!passwordData) {
              return response
                .status(BAD_REQUEST)
                .json({ message: "Required field(s) missing." });
            } else {
              if (
                passwordData.currentPassword.toLowerCase() ===
                passwordData.newPassword.toLowerCase()
              ) {
                return response
                  .status(BAD_REQUEST)
                  .json({
                    message:
                      "Hey buddy. Your current password cannot be your new password.",
                  });
              } else {
                if (
                  passwordData.newPassword.toLowerCase() !==
                  passwordData.confirmNewPassword.toLowerCase()
                ) {
                  return response
                    .status(BAD_REQUEST)
                    .json({
                      message:
                        "Please enter same value for both new password and confirm password fields.",
                    });
                } else {
                  if (
                    await bcrypt.compareSync(
                      passwordData.currentPassword,
                      userInDB.password
                    )
                  ) {
                    const newPassword = await bcrypt.hashSync(
                      passwordData.newPassword,
                      10
                    );
                    userInDB.updateOne(
                      { password: newPassword },
                      (err: any) => {
                        if (err) {
                          return response.status(INTERNAL_SERVER_ERROR).json({
                            message:
                              "An error occurred while updating profile. Please try again.",
                          });
                        } else {
                          return response
                            .status(OK)
                            .json({
                              message: "Password updated successfully.",
                            });
                        }
                      }
                    );
                  } else {
                    return response.status(BAD_REQUEST).json({
                      message:
                        "The current password supplied is invalid. Please try again.",
                    });
                  }
                }
              }
            }
          }
        }
      );
    }
  },

  changeProfilePicture: (
    request: IGetUserAuthInfoRequest | any,
    response: any
  ) => {
    const user = request.user;
    if (!user) {
      return response
        .status(UNAUTHORIZED)
        .json({ message: "Unauthorized. Kindly login to continue." });
    } else {
      const { newProfilePicture } = request.body;
      if (!newProfilePicture) {
        return response
          .status(BAD_REQUEST)
          .json({ message: "Required field(s) missing." });
      } else {
        UserModel.findOne(
          { username: sanitize(user.username) },
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
              userInDB.updateOne(
                { profilePicture: sanitize(newProfilePicture.url) },
                (err: any) => {
                  if (err) {
                    return response.status(INTERNAL_SERVER_ERROR).json({
                      message:
                        "An error occurred while changing profile picture. Please try again.",
                    });
                  } else {
                    const dataToSend = {
                      status:
                        "Profile picture updated successfuuly. Please log out and log back in.",
                      profilePicture: userInDB.profilePicture,
                    };
                    return response.status(OK).json({ message: dataToSend });
                  }
                }
              );
            }
          }
        );
      }
    }
  },

  getUser: async (request: IGetUserAuthInfoRequest | any, response: Response) => {
    try {
       try {
         const { user } = request;
         if (!user) {
           return response
             .status(UNAUTHORIZED)
             .json({ message: "Please login to continue." });
         }
     
        
         const userInDB = await UserModel.findOne({
           username: sanitize(user.username)
         }).select('-password')

         if (!userInDB) {
           return response
             .status(UNAUTHORIZED)
             .json({ message: "Please login to continue." });
         }

         
         return response
           .status(CREATED)
           .json(userInDB);
       } catch (error) {
         return response
           .status(INTERNAL_SERVER_ERROR)
           .json({ message: "An error occurred. Please try again." });
       }
    } catch (error) {
      
    }
  }




};
