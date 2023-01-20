import Mongoose = require("mongoose");
import logger from "jet-logger";

let database: Mongoose.Connection;

export const Connect = () => { 
  const uri: any = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;
  // const uri: any = "mongodb://localhost:27017/cysec-hacking-labs";

  if (database) {
    return;
  }

  Mongoose.connect(uri);

  database = Mongoose.connection;

  database.once("open", async () => {
    logger.info("Connected to database");
    console.log('connected to db')
  });

  database.on("error", () => {
    logger.err("Error connecting to database");
  });
};

export const Disconnect = () => {
  if (!database) {
    return;
  }

  Mongoose.disconnect();
};
