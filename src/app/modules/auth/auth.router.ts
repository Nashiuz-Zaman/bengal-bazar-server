import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshAccessTokenController,
} from "./controller/auth.controller.js";
import {
  forgotPasswordController,
  resetPasswordController,
} from "./controller/password.controller.js";

const authRouter = Router();

/**
 * Authentication Management
 */
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);

/**
 * Token Rotation
 */
authRouter.post("/refresh", refreshAccessTokenController);

/**
 * Password Recovery
 */
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);

export { authRouter };
