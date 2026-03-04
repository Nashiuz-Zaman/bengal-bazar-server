import { Prisma } from "../../../../generated/prisma/client.js";
import { ApiError } from "../../../../utils/ApiError.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { clientUrl } from "../../../../index.js";
import { findUser } from "../repository/user.query.repository.js";
import {
  createUser,
  updateUserInDb,
  verifyUserInDb,
} from "../repository/user.account.repository.js";

/**
 * Handles user registration with a stateful 30-minute verification window.
 */
export const registerUser = async (data: Prisma.UserCreateInput) => {
  const existingUser = await findUser({ email: data.email });
  if (existingUser)
    throw ApiError.Conflict("User already exists. Please login");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password as string, saltRounds);

  // 1. Generate a secure random string (Stateful Token)
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // 2. Set expiration to 30 minutes from now
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  return await createUser({
    ...data,
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    verificationExpiresAt: expiresAt,
  });
};

/**
 * Validates verification by checking the token match AND the DB expiration timestamp.
 */
export const verifyUser = async (email: string, token: string) => {
  if (!email || !token) return clientUrl;

  // 1. Fetch user with the necessary verification fields
  const user = await findUser({ email }, [
    "emailVerificationToken",
    "verificationExpiresAt",
  ]);

  // 2. Initial Guard: Check existence and status
  if (!user?.id || user.status !== "PENDING") return clientUrl;

  // 3. Token Match Check
  if (user.emailVerificationToken !== token) return clientUrl;

  // 4. Expiration Check: Is the current time past the DB timestamp?
  if (user.verificationExpiresAt && new Date() > user.verificationExpiresAt) {
    return `${clientUrl}/verification-expired`;
  }

  // 5. Finalize Verification
  const updatedUser = await verifyUserInDb(user.id);

  return `${clientUrl}/verification-successful?email=${encodeURIComponent(updatedUser.email)}`;
};

/**
 * Generates a new verification token and extends the expiry for a pending user.
 */
export const resendVerificationToken = async (email: string) => {
  // 1. Find the user
  const user = await findUser({ email });

  if (!user?.id) {
    throw ApiError.NotFound("No account found with this email address.");
  }

  // 2. Prevent resending if already verified
  if (user.status === "ACTIVE" || user.isVerified) {
    throw ApiError.BadRequest(
      "This account is already verified. Please login.",
    );
  }

  // 3. Generate new stateful token and 30-minute expiry
  const newToken = crypto.randomBytes(32).toString("hex");
  const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // 4. Update the DB (Overwriting the old token instantly invalidates it)
  const updatedUser = await updateUserInDb(user.id, {
    emailVerificationToken: newToken,
    verificationExpiresAt: newExpiresAt,
  });

  return updatedUser;
};
