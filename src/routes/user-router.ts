import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken";
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const { UNAUTHORIZED, NOT_FOUND } = StatusCodes;

// const secret: any = process.env.JWT_SECRET;
const accessSecret: any = process.env.ACCESS_SECRET;
interface IGetUserAuthInfoRequest extends Request {
  user: any;
}

import { Register } from "../controllers/user/register";
import { Login } from "../controllers/user/login";
import { GetConfig } from "../controllers/user/getconfig";
import { GetLabInfo } from "../controllers/user/getLabs";
import { GetIPAddress } from "../controllers/user/getIPAddress";
import { StartMachine } from "../controllers/user/startMachine";
import { GetMachineInfo } from "../controllers/user/getMachine";
import { CreateFeedback } from "../controllers/user/getFeedback";
import { JoinNewsLetter } from "../controllers/user/newsLetter";
import { LeaderBoard } from "../controllers/user/leaderBoard";
import { Competition } from "../controllers/user/competition";
import { ResetPassword } from "../controllers/user/resetPassword";
import { Search } from "../controllers/user/search";
import { Profile } from "../controllers/user/profile";

// Constants,
const router = Router();

// Paths
router.post("/register", multipartMiddleware, Register.createUser);

router.post("/verify", multipartMiddleware, Register.verifyToken);

router.post("/login", multipartMiddleware, Login.loginUser);
router.post('/refresh', multipartMiddleware, Login.refresh)
router.get('/logout', multipartMiddleware, Login.logout )
router.post("/forgot", multipartMiddleware, ResetPassword.reset);

router.post("/reset", multipartMiddleware, ResetPassword.verifyResetToken);

router.post(
  "/update-profile",
  verifyToken,
  multipartMiddleware,
  Profile.update
);

router.post(
  "/update-password",
  verifyToken,
  multipartMiddleware,
  Profile.updatePassword
);
router.get('/user', verifyToken, multipartMiddleware, Profile.getUser)
router.post(
  "/update-profile-picture",
  verifyToken,
  multipartMiddleware,
  Profile.changeProfilePicture
);

router.post("/request-token", multipartMiddleware, Register.requestToken);

router.get("/getconfig", verifyToken, multipartMiddleware, GetConfig.getConfig);

router.post("/search", multipartMiddleware, Search.searchLabs);

router.get("/getlabs", GetLabInfo.getLabs);

router.get("/getlab/:labID", verifyToken, GetLabInfo.getLab);

router.post(
  "/check",
  verifyToken,
  multipartMiddleware,
  GetLabInfo.checkTaskAnswer
);

router.post(
  "/check-completion-status",
  verifyToken,
  multipartMiddleware,
  GetLabInfo.checkCompletionStatus
);

router.get("/completed-rooms", verifyToken, GetLabInfo.getUserCompletedRooms);

router.get("/get-current-ip", verifyToken, GetIPAddress.getIPAddress);

router.post(
  "/start-machine",
  verifyToken,
  multipartMiddleware,
  StartMachine.start
);



router.get("/obtain-machine-ip", verifyToken, StartMachine.obtainIP);

router.get("/stop-machine", verifyToken, StartMachine.stopMachine);

router.get("/get-downloadables", verifyToken, GetMachineInfo.getMachines);

router.get("/get-machines", verifyToken, GetMachineInfo.getLabMachines);

router.get("/get-machine/:machineID", verifyToken, GetMachineInfo.getMachine);

router.get(
  "/get-running-instance",
  verifyToken,
  GetMachineInfo.getRunningInstance
);

router.post(
  "/send-feedback",
  verifyToken,
  multipartMiddleware,
  CreateFeedback.createFeedback
);

router.post("/join-newsletter", multipartMiddleware, JoinNewsLetter.join);

router.get("/get-popular-labs", GetLabInfo.getPopularLabs);

router.get("/get-recent-labs", GetLabInfo.getRecentLabs);

router.get("/get-leaderboard", LeaderBoard.getLeaderBoard);

router.get("/competitions", Competition.getCompetitions);

router.all("**", (_req: Request, res: Response) => {
  return res.status(NOT_FOUND).json({ message: "Page not found." });
});

// Export default
export default router;

function verifyToken(
  req: IGetUserAuthInfoRequest | any,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader =
  req.headers["authorization"]; 
  const token =
  (authorizationHeader && authorizationHeader.split(" ")[1]) ||
  req.headers.authorization;
  
  console.log(token);
  if (!token || token == null) {
    return res
      .status(UNAUTHORIZED)
      .send({ message: "Unauthorized. Kindly login to proceed." });
  } else {
    jwt.verify(token, accessSecret, (err: any, user: any) => {
      if (err) {
        return res.status(UNAUTHORIZED).json({ message: err.message });
      } else {
        req.user = user;
        next();
      }
    });
  }
}
