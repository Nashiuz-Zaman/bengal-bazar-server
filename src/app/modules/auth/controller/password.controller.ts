import { RequestHandler } from "express";
import { sendSuccess } from "../../../../utils/sendSuccess.js";
import { forgotPassword, resetPassword } from "../service/password.service.js";

/**
 * Initiates the forgot password process.
 * Expects { email } in req.body.
 */
export const forgotPasswordController: RequestHandler = async (req, res) => {
  const { email } = req.body;
  await forgotPassword(email);

  sendSuccess(res, {
    message:
      "If an account exists with that email, a reset link has been sent.",
  });
};

/**
 * Completes the password reset process.
 * Expects { token, newPassword } in req.body.
 */
export const resetPasswordController: RequestHandler = async (req, res) => {
  const { token, newPassword } = req.body;
  await resetPassword(token, newPassword);

  sendSuccess(res, {
    message: "Password has been reset successfully. You can now log in.",
  });
};
