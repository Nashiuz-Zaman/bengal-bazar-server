import crypto from "crypto";
import bcrypt from "bcrypt";
import { ApiError } from "../../../../utils/ApiError.js";
import {
  findUserForAuth,
  updatePassword,
} from "../repository/auth.repository.js";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  findValidPasswordResetToken,
} from "../repository/passwordReset.repository.js";
import { clientUrl } from "../../../../index.js";
import { sendPasswordResetEmail } from "../../email/service/sendPasswordResetEmail.js";
import { logger } from "../../../../utils/logger.js";

export const forgotPassword = async (email: string) => {
  if (!email) {
    throw ApiError.BadRequest("Email is required");
  }

  const user = await findUserForAuth(email);
  if (!user) throw ApiError.NotFound("User not found");

  // 1. Create random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  // 2. Save to DB (Repository handles clearing old ones)
  await createPasswordResetToken({
    userId: user.id,
    token: resetToken,
    expiresAt,
  });

  // 3. Send Email
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  sendPasswordResetEmail(resetUrl, user.name, email).catch((err: Error) =>
    logger.error({ err, email }, "Failed to send password reset email"),
  );
};

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token || !newPassword) {
    throw ApiError.BadRequest("Token and new password are required");
  }

  // Ensure password meets minimum length requirements if not handled by Zod/Validator
  if (newPassword.length < 6) {
    throw ApiError.BadRequest("Password must be at least 6 characters long");
  }

  // 1. Validate Token via Repo
  const resetRecord = await findValidPasswordResetToken(token);
  if (!resetRecord) throw ApiError.BadRequest("Invalid or expired token");

  // 2. Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // 3. Update Password & Kill all sessions (Atomic Repo call)
  await updatePassword(resetRecord.userId, passwordHash);

  // 4. Delete the used reset token
  await deletePasswordResetToken(token);
};
