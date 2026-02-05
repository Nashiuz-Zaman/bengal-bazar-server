import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../utils";

export const globalErrorHandler = (
  err: any,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  // 1. --- CHECK IF ALREADY AN APPERROR ---
  if (error instanceof AppError) {
    return sendResponse(error, res);
  }

  // 2. --- PRISMA KNOWN REQUEST ERRORS ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Duplicate value
        const field = (err.meta?.target as string[])?.join(", ") || "field";

        error = new AppError(
          `The ${field} already exists. Please use another.`,

          400,
        );

        break;

      case "P2025": // Not found
        error = new AppError("The requested record was not found.", 404);

        break;

      case "P2003": // Foreign key failed (e.g., Category ID doesn't exist)
        error = new AppError(
          "Invalid reference ID. The related record does not exist.",

          400,
        );

        break;

      case "P1001": // Database server not reachable (Neon waking up)
        error = new AppError(
          "Database is starting up. Please try again in 5 seconds.",

          503,
        );

        break;

      default:
        // Other database errors remain 500s but are tagged as not operational

        error = new AppError("A database error occurred.", 500);

        error.isOperational = false;
    }
  }

  // 3. --- PRISMA VALIDATION ERRORS ---
  else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError("Invalid data format. Please check your inputs.", 400);
  }

  // 4. --- FINAL FALLBACK ---
  // If it's not an AppError and not a recognized Prisma error, wrap it.
  if (!(error instanceof AppError)) {
    error = new AppError(
      err.message || "Internal Server Error",
      err.statusCode || 500,
    );
    // If it wasn't caught by specific handlers, it's likely not operational
    if (!err.statusCode || err.statusCode === 500) {
      error.isOperational = false;
    }
  }

  return sendResponse(error, res);
};

// Helper to keep the handler clean
const sendResponse = (error: AppError, res: Response) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  } else {
    res.status(statusCode).json({
      status,
      message: error.isOperational
        ? error.message
        : "Something went wrong. Please try later",
    });
  }
};
