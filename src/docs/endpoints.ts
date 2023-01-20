import { loginUser } from "./user/loginUser";
import { registerUser } from "./user/registerUser";
import { getConfig } from "./user/getConfig";

export const endpoints = {
  paths: {
    "/users/login": {
      ...loginUser,
    },
    "/users/register": {
      ...registerUser,
    },
    "/users/getconfig": {
      ...getConfig,
    },
  },
};
