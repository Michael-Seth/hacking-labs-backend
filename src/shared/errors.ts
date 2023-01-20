import HttpStatusCodes from "http-status-codes";

export abstract class CustomError extends Error {
  public readonly HttpStatus = HttpStatusCodes.BAD_REQUEST;

  constructor(msg: string, httpStatus: number) {
    super(msg);
    this.HttpStatus = httpStatus;
  }
}

export class ParamMissingError extends CustomError {
  public static readonly Msg =
    "One or more of the required parameters was missing.";
  public static readonly HttpStatus = HttpStatusCodes.BAD_REQUEST;

  constructor() {
    super(ParamMissingError.Msg, ParamMissingError.HttpStatus);
  }
}

export class UserNotFoundError extends CustomError {
  public static readonly Msg = "Unable to find matching user information";
  public static readonly HttpStatus = HttpStatusCodes.NOT_FOUND;

  constructor() {
    super(UserNotFoundError.Msg, UserNotFoundError.HttpStatus);
  }
}

export class ConnectionError extends CustomError {
  public static readonly Msg = "Unable to establish connection";
  public static readonly HttpStatus = HttpStatusCodes.SERVICE_UNAVAILABLE;

  constructor() {
    super(ConnectionError.Msg, ConnectionError.HttpStatus);
  }
}
