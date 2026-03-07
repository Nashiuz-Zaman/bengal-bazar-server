import { getVerificationEmailHtml } from "../generator-helpers/getVerificationEmailHtml.js";
import { sendEmail } from "../../../../libs/nodemailer.js";

export const sendAccountVerificationEmail = async (
  url: string,
  name: string,
  email: string,
) => {
  const html = getVerificationEmailHtml({
    customerName: name,
    verificationLink: url,
    year: new Date().getFullYear(),
  });

  const result = await sendEmail(email, "Verify Account", html);

  return result ? true : false;
};
