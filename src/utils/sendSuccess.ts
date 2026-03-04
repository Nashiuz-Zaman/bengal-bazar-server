import httpStatus from "http-status";
import { Response } from "express";

type TSendSuccess = (
  res: Response,
  params?: {
    code?: number;
    data?: any;
    message?: string;
  },
) => void;

export const sendSuccess: TSendSuccess = (res, params = {}) => {
  const { data = null, message, code = httpStatus.OK } = params;

  res.status(code).json({
      success: true,
    ...(message && { message }),
    ...(data && { data }),
  });
};
