import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";

import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import StatusCodes from "http-status-codes";
import "express-async-errors";

const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerAuth = require("express-basic-auth");
const docs = require("./docs");

import apiRouter from "./routes/api";
import logger from "jet-logger";
import { CustomError } from "./shared/errors";
import { Connect } from "./database/database";

// Constants
const app = express();
Connect();

/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: "50mb",
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Add api router
app.use("/api/v1", apiRouter);
app.use(
  "/api-docs",
  swaggerAuth({
    users: { "swagger-user": `${process.env.SWAGGER_AUTH_PASSWORD}` },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(docs, { explorer: true })
);

// Error handling
app.use(
  (err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status =
      err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
    return res.status(status).json({
      error: err.message,
    });
  }
);

/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set views dir
// const viewsDir = path.join(__dirname, 'views');
// app.set('views', viewsDir);

// // Set static dir
// const staticDir = path.join(__dirname, 'public');
// app.use(express.static(staticDir));

// // Serve index.html file
// app.get('*', (_: Request, res: Response) => {
//     res.sendFile('index.html', {root: viewsDir});
// });

// Export here and start in a diff file (for testing).
export default app;
