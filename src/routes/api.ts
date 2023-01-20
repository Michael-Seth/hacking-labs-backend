import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import userRouter from "./user-router";
import adminRouter from "./admin-routes";

const { NOT_FOUND } = StatusCodes;

// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use("/users", userRouter);

baseRouter.use("/manage", adminRouter);

baseRouter.all("**", (_req: Request, res: Response) => {
  return res.status(NOT_FOUND).send("Page not found.");
});

// Export default.
export default baseRouter;
