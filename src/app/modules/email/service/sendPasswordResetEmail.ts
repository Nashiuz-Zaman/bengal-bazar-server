import { getPasswordResetEmailHtml } from "../generator-helpers/getPasswordResetHtml.js";
import { sendEmail } from "../../../../lib/nodemailer.js";

/**
 * Service to send a password reset link to the user.
 * * @param url - The secure frontend link containing the reset token.
 * @param name - The customer's name for personalization.
 * @param email - The destination address.
 */
export const sendPasswordResetEmail = async (
  url: string,
  name: string,
  email: string,
) => {
  // We pass only the required props as 'year' is handled inside the generator
  const html = getPasswordResetEmailHtml({
    customerName: name,
    passwordResetLink: url,
  });

  const result = await sendEmail(
    email,
    "Reset Your Password – Bengal Bazar",
    html,
  );

  return !!result;
};
