import { RequestHandler } from "express";
import * as userAccountServices from "./services/user.account.service.js";
import * as userAdminServices from "./services/user.admin.service.js";
import * as userQueryServices from "./services/user.query.service.js";
import { getServerUrl } from "../../../utils/getServerUrl.js";
import { sendAccountVerificationEmail } from "../email/service/sendAccountVerificationEmail.js";
import { sendSuccess } from "../../../utils/sendSuccess.js";
import { clientUrl } from "../../../index.js";
import { getParam } from "../../../utils/expressParams.js";
import { ApiError } from "../../../utils/ApiError.js";

export const registerUserController: RequestHandler = async (req, res) => {
  const newUser = await userAccountServices.createUser(req.body);

  sendAccountVerificationEmail(
    // construct the verification email
    `${getServerUrl(req)}/users/verify?email=${
      newUser.email
    }&token=${newUser.emailVerificationToken}`,
    newUser.name,
    newUser.email,
  ).catch((err) =>
    console.log("Error sending account verification email: ", err),
  );

  sendSuccess(res, {
    message: "Signup successful. Please check your email for verification.",
  });
};

export const verifyUserController: RequestHandler = async (req, res) => {
  const email = req.query.email as string;
  const token = req.query.token as string;

  const url = await userAccountServices.verifyUser(email, token);

  if (url) return res.redirect(url);

  res.redirect(clientUrl);
};

/* --- Admin Controllers --- */

/**
 * Batch block users based on an array of IDs.
 */
export const blockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.blockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch unblock users based on an array of IDs.
 */
export const unblockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.unblockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch delete users based on an array of IDs.
 */
export const deleteUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.deleteUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Retrieves a list of users with pagination and filtering.
 * Passes the entire req.query to the repository via the service.
 */
export const getUsersController: RequestHandler = async (req, res) => {
  const { data, meta } = await userQueryServices.getUsers(req.query);

  sendSuccess(res, {
    message: "Users retrieved successfully",
    data: { users: data, meta },
  });
};

/**
 * Retrieves a single user profile.
 * Dynamically parses "include" query params to fetch extra related data.
 */
export const getUserController: RequestHandler = async (req, res) => {
  const id = getParam(req.params.id);

  const extraFields = req.query.include
    ? (req.query.include as string).split(",")
    : [];

  const user = await userQueryServices.getUser({ id }, extraFields as any);

  sendSuccess(res, {
    message: "User profile retrieved successfully",
    data: user,
  });
};

/**
 * Controller to handle the 'Resend Email' request.
 */
export const resendVerificationController: RequestHandler = async (
  req,
  res,
) => {
  const { email } = req.body;

  if (!email) throw ApiError.BadRequest("Email is required.");

  // 1. Update the token in the database
  const user = await userAccountServices.resendVerificationToken(email);

  // 2. Send the new email (Background task)
  sendAccountVerificationEmail(
    `${getServerUrl(req)}/users/verify?email=${user.email}&token=${user.emailVerificationToken}`,
    user.name,
    user.email,
  ).catch((err) => console.error("Resend Email Error:", err));

  // 3. Success response
  sendSuccess(res, {
    message: "A new verification link has been sent to your email.",
  });
};
