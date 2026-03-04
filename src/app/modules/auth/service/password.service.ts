import crypto from "crypto";
import * as authRepo from "../repository/auth.repository.js";
import * as resetRepo from "../repository/passwordReset.repository.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { sendEmail } from "../../../../lib/nodemailer.js";

export const forgotPassword = async (email: string) => {
  const user = await authRepo.findUserForAuth(email);
  if (!user) throw ApiError.NotFound("User not found");

  // 1. Create random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  // 2. Save to DB (Repository handles clearing old ones)
  await resetRepo.createResetToken({ userId: user.id, token: resetToken, expiresAt });

  // 3. Send Email
  const resetUrl = `https://yourfrontend.com/reset-password?token=${resetToken}`;
  await sendEmail(user.email, "Password Reset", resetUrl);
};

export const resetPassword = async (token: string, newPassword: string) => {
  // 1. Validate Token via Repo
  const resetRecord = await resetRepo.findValidResetToken(token);
  if (!resetRecord) throw ApiError.BadRequest("Invalid or expired token");

  // 2. Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // 3. Update Password & Kill all sessions (Atomic Repo call)
  await authRepo.updatePassword(resetRecord.userId, passwordHash);

  // 4. Delete the used reset token
  await resetRepo.deleteResetToken(token);
};