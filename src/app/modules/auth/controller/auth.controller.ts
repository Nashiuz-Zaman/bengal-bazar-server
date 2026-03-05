import { RequestHandler } from "express";
import { sendSuccess } from "../../../../utils/sendSuccess.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { setCookie, cleanCookie } from "../../../../utils/cookie.js";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../service/auth.service.js";

/**
 * Login: Sets both cookies using specific paths and expirations.
 */
export const loginController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUser(req.body);

  // 1. Access Token (Global path)
  setCookie(res, {
    cookieName: "accessToken",
    cookieContent: accessToken,
    maxAge: 15 * 60 * 1000, // 15 mins
    path: "/",
  });

  // 2. Refresh Token (Restricted path)
  setCookie(res, {
    cookieName: "refreshToken",
    cookieContent: refreshToken,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/auth/refresh",
  });

  sendSuccess(res, {
    message: "Login successful",
    data: { user },
  });
};

/**
 * Logout: Uses cleanCookie to strip both tokens from the browser.
 */
export const logoutController: RequestHandler = async (req, res) => {
  await logoutUser(req.cookies.refreshToken);

  // Use the utility to clear both cookies using their exact original paths
  cleanCookie(res, "accessToken", { path: "/" });
  cleanCookie(res, "refreshToken", {
    path: "auth/refresh",
  });

  sendSuccess(res, { message: "Logged out successfully" });
};

/**
 * Refresh: Rotates the Access Token cookie.
 */
export const refreshAccessTokenController: RequestHandler = async (
  req,
  res,
) => {
  const newAccessToken = await refreshAccessToken(req.cookies.refreshToken);

  // Set the new Access Token
  setCookie(res, {
    cookieName: "accessToken",
    cookieContent: newAccessToken,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  sendSuccess(res, { message: "Access token rotated" });
};
