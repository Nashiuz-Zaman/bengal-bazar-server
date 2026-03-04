import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

export const getRefundProcessedEmailHtml = (
  orderId: string,
  customerName: string,
  amount: string,
  reason: string,
  year: number,
): string => {
  return `
  ${getEmailWrapperStart("Your Refund Has Been Processed")}
  ${getEmailHeader("Refund Issued")}

  <!-- Body -->
  <tr>
    <td style="padding:30px; color:#374151; font-size:16px; line-height:1.5; text-align:center;">
      <p style="margin:0 0 10px 0;">Hello <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 20px 0;">
        We’ve processed your refund for order <strong>#${orderId}</strong>.<br />
        The refunded amount of <strong>${amount}</strong> should appear in your account within a few business days depending on your payment provider.
      </p>

      <p style="margin:0 0 20px 0;">
        Reason: <em>${reason}</em>
      </p>

      <p style="margin:30px 0 0 0; font-size:14px; color:#6b7280;">
        If you have any questions or concerns, feel free to contact our support team.
      </p>
    </td>
  </tr>

  ${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};
