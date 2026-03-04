import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

interface IVerificationEmailProps {
  customerName: string;
  verificationLink: string;
  year: number;
}

export const getVerificationEmailHtml = ({
  customerName,
  verificationLink,
  year,
}: IVerificationEmailProps): string => {
  return `
${getEmailWrapperStart("Verify Your Email")}
${getEmailHeader("Welcome to Bengal Bazar!")}

<tr>
  <td style="padding:40px 30px; color:#374151; font-size:16px; line-height:1.6;">
    <p style="margin:0 0 15px 0; font-size:18px;">Hi <strong>${customerName}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      We're thrilled to have you join <strong>Bengal Bazar</strong> — your one-stop destination for gadgets, fashion, food, and more. 
    </p>
    <p style="margin:0 0 20px 0;">
      To get started and secure your account, please verify your email address by clicking the button below:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:40px auto;">
      <tr>
        <td align="center" bgcolor="#a439da" style="border-radius:6px;">
          <a
            href="${verificationLink}"
            target="_blank"
            style="display:inline-block; padding:16px 36px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; background-color:#a439da; border-radius:6px;"
          >
            Verify My Email
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:30px 0 10px 0; font-size:14px; color:#6b7280; text-align:center;">
      This link will expire in 24 hours.
    </p>
    
    <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eee; font-size:12px; color:#9ca3af; text-align:center;">
      <p style="margin:0;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin:5px 0 0 0; word-break:break-all; color:#a439da;">
        ${verificationLink}
      </p>
    </div>
  </td>
</tr>

<tr>
  <td style="padding:0 30px 30px 30px; text-align:center; font-size:13px; color:#9ca3af;">
    If you didn’t sign up for a Bengal Bazar account, you can safely ignore this email.
  </td>
</tr>

${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};