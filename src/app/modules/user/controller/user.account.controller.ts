import { RequestHandler } from "express";
import * as userAccountServices from "../services/user.account.service.js";
import { sendAccountVerificationEmail } from "../../email/service/sendAccountVerificationEmail.js";
import { getServerUrl } from "../../../../utils/getServerUrl.js";
import { sendSuccess } from "../../../../utils/sendSuccess.js";
import { clientUrl } from "../../../../index.js";
import { ApiError } from "../../../../utils/ApiError.js";

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
