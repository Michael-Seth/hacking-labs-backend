import { Document, Model } from 'mongoose';

export interface IUser {
    email: string;
    username: string;
    fullname?: string;
    firstname?: string;
    lastname?: string;
    role: string;
    password: string;
    runninginstances: Array<any>;
    profilePicture: string;
    isVerified: Boolean;
    points: Number;
    refreshToken: Array<string>;
    career_path: string;
    completedRooms: Array<any>;
}

export interface IUserDocument extends IUser, Document {};

export interface IUserModel extends Model<IUserDocument> {};