import httpStatus from "http-status";
import { AppError } from "./AppError";

export const ApiError = {
  BadRequest: (msg: string, err?: Error) =>
    new AppError(msg, httpStatus.BAD_REQUEST, err),
  Unauthorized: (msg: string = "Unauthorized", err?: Error) =>
    new AppError(msg, httpStatus.UNAUTHORIZED, err),
  Forbidden: (msg: string = "Forbidden", err?: Error) =>
    new AppError(msg, httpStatus.FORBIDDEN, err),
  NotFound: (msg: string = "Not Found", err?: Error) =>
    new AppError(msg, httpStatus.NOT_FOUND, err),
  Conflict: (msg: string = "Conflict", err?: Error) =>
    new AppError(msg, httpStatus.CONFLICT, err),
  Internal: (msg: string = "Internal Server Error", err?: Error) =>
    new AppError(msg, httpStatus.INTERNAL_SERVER_ERROR, err),
};
