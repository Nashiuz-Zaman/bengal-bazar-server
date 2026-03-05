import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

interface IPasswordResetEmailProps {
  customerName: string;
  passwordResetLink: string;
}

export const getPasswordResetEmailHtml = ({
  customerName,
  passwordResetLink,
}: IPasswordResetEmailProps): string => {
  // Internalizing the year as requested
  const year = new Date().getFullYear();

  return `
${getEmailWrapperStart("Reset Your Password")}
${getEmailHeader("Password Reset Request")}

<tr>
  <td style="padding:40px 30px; color:#374151; font-size:16px; line-height:1.6;">
    <p style="margin:0 0 15px 0; font-size:18px;">Hi <strong>${customerName}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      We received a request to reset the password for your <strong>Bengal Bazar</strong> account. No changes have been made yet.
    </p>
    <p style="margin:0 0 20px 0;">
      You can reset your password by clicking the secure button below:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:40px auto;">
      <tr>
        <td align="center" bgcolor="#a439da" style="border-radius:6px;">
          <a
            href="${passwordResetLink}"
            target="_blank"
            style="display:inline-block; padding:16px 36px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; background-color:#a439da; border-radius:6px;"
          >
            Reset My Password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:30px 0 10px 0; font-size:14px; color:#6b7280; text-align:center;">
      For your security, this link will expire in <strong>1 hour</strong>.
    </p>
    
    <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eee; font-size:12px; color:#9ca3af; text-align:center;">
      <p style="margin:0;">
        If you're having trouble with the button, copy and paste this link into your browser:
      </p>
      <p style="margin:5px 0 0 0; word-break:break-all; color:#a439da;">
        ${passwordResetLink}
      </p>
    </div>
  </td>
</tr>

<tr>
  <td style="padding:0 30px 30px 30px; text-align:center; font-size:13px; color:#9ca3af;">
    If you did not request a password reset, you can safely ignore this email. Your password will remain the same.
  </td>
</tr>

${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};
