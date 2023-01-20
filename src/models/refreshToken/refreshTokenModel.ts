import { model } from "mongoose";
import { ITokenDocument } from "./refresh.token.types";
import RefreshTokenSchema from "./refresh.token.schema";

export const RefreshTokenModel = model<ITokenDocument>("refreshtoken", RefreshTokenSchema);
