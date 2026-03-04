import bcrypt from "bcrypt";
import * as authRepo from "../repository/auth.repository.js";
import * as refreshRepo from "../repository/refreshSession.repository.js";
import { generateToken, verifyToken } from "../../../../utils/jsonWebTokens.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { config } from "../../../../config/env.js";
import { hashToken } from "../auth.util.js";

interface ILoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (payload: ILoginPayload) => {
  // 1. Find user with password
  const user = await authRepo.findUserForAuth(payload.email);
  if (!user) throw ApiError.Unauthorized("Invalid email/password");

  // 2. Verify Password
  const isPasswordMatch = await bcrypt.compare(
    payload.password,
    user.password!,
  );
  if (!isPasswordMatch) throw ApiError.Unauthorized("Invalid email/password");

  // 3. Generate Tokens
  const accessToken = generateToken(
    { id: user.id, role: user.role },
    config.jwtSecret!,
    "15m",
  );
  const refreshToken = generateToken({ id: user.id }, config.jwtSecret!, "7d");
  const tokenHash = hashToken(refreshToken);

  // 4. Save Session (Hash the refresh token before saving for security)

  await refreshRepo.createSession({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { accessToken, refreshToken, user };
};

export const logoutUser = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);
  await refreshRepo.deleteSession(tokenHash);
};

export const refreshAccessToken = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);

  // 2. Check Database
  const session = await refreshRepo.findValidSession(tokenHash);
  if (!session) throw ApiError.Unauthorized("Session expired or invalid");

  // 3. Generate new Access Token
  const accessToken = generateToken(
    { id: session.userId, role: session.user.role },
    config.jwtSecret!,
    "15m",
  );

  return { accessToken };
};
