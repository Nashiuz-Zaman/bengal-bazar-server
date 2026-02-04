import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "@app/utils";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  // --- PRISMA ERROR HANDLING ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed (e.g., duplicate email)
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") || "field";
      error = new AppError(
        `Duplicate value for ${field}. Please use another value.`,
        400,
        err,
      );
    }
    // P2025: Record not found
    if (err.code === "P2025") {
      error = new AppError("Record not found.", 404, err);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError("Invalid data provided to the database.", 400, err);
  }

  // --- RESPONSE LOGIC ---
  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  // Production vs Development visibility
  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  } else {
    // In Production: Don't leak 500 error details
    res.status(statusCode).json({
      status,
      message: error.isOperational
        ? error.message
        : "Something went very wrong!",
    });
  }
};
