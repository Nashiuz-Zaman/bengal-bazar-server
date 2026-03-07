// core
import { config } from "../config/env.js";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";

const logSMTPSuccess = async () => console.log("SMTP connection OK");

const smtpTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
  tls: { rejectUnauthorized: false },
});

export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  from: string = config.emailSender as string,
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[],
) => {
  try {
    const recipient = Array.isArray(to) ? to.join(",") : to;

    await smtpTransporter.verify();
    logSMTPSuccess();

    const sendResult = await smtpTransporter.sendMail({
      from,
      to: recipient,
      subject,
      text: html.replace(/<(?:.|\n)*?>/gm, ""),
      html,
      attachments,
    });

    return !!sendResult.messageId;
  } catch (_error) {
    throw ApiError.Internal("Something went wrong");
  }
};
