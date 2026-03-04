// imports
import { Router } from "express";
import {
  registerUserController,
  verifyUserController,
  getUsersController,
  getUserController,
  blockUsersController,
  unblockUsersController,
  deleteUsersController,
  resendVerificationController,
} from "./user.controller.js";

// create instances
const userRouter = Router();

/**
 * Public Routes
 */
// Account creation and verification
userRouter.post("/register", registerUserController);
userRouter.get("/verify", verifyUserController);
// resend verification email
userRouter.post("/resend-verification", resendVerificationController);

/**
 * Retrieval Routes (Often protected by 'auth' middleware)
 */
// Get all users (with filters/pagination)
userRouter.get("/", getUsersController);

// Get single user by ID
userRouter.get("/:id", getUserController);

/**
 * Admin Routes (Should be protected by 'auth' and 'roleCheck(ADMIN)')
 */
// Batch block users
userRouter.patch("/block", blockUsersController);

// Batch unblock users
userRouter.patch("/unblock", unblockUsersController);

// Batch delete users
userRouter.delete("/delete", deleteUsersController);

export default userRouter;
