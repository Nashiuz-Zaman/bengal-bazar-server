import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

interface IOrderCancelledEmailProps {
  orderNumber: string;
  customerName: string;
  reason?: string;
  year: number;
}

export const getOrderCancelledEmailHtml = ({
  orderNumber,
  customerName,
  reason,
  year,
}: IOrderCancelledEmailProps): string => {
  return `
${getEmailWrapperStart("Order Cancelled")}
  ${getEmailHeader("Order Cancelled")}

  <tr>
    <td style="padding:30px; text-align:center; font-size:16px; color:#333; line-height:1.5;">
      <p style="margin:0 0 15px 0; font-size:16px;">
        Hello <strong>${customerName}</strong>,
      </p>
      <p style="margin:0 0 15px 0;">
        We wanted to let you know that your order <strong>#${orderNumber}</strong> has been cancelled.
      </p>
      ${
        reason
          ? `<div style="margin:20px auto; padding:15px; background-color:#f8f9fa; border-left:4px solid #dee2e6; max-width:400px; text-align:left;">
               <span style="font-weight:bold; color:#555; font-size:12px; text-transform:uppercase;">Reason for Cancellation:</span><br/>
               <span style="font-style:italic; color:#333;">${reason}</span>
             </div>`
          : ""
      }
      <p style="margin:20px 0 0 0; font-size:14px; color:#555;">
        If this was a mistake or you have questions regarding a refund, please contact our support team.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 20px 20px;">
      <table width="100%" cellpadding="15" cellspacing="0" style="background-color:#fff5f5; border:1px solid #feb2b2; border-radius:8px;">
        <tr>
          <td style="text-align:center; font-size:16px; color:#c53030; font-weight:bold;">
            Status: Cancelled
          </td>
        </tr>
        <tr>
          <td style="text-align:center; font-size:14px; color:#4a5568; padding-top:0;">
            Order Number: <strong>${orderNumber}</strong>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 30px; text-align:center; font-size:13px; color:#888; border-top:1px solid #eee;">
      Thank you for your interest in Bengal Bazar. We hope to serve you better next time.
    </td>
  </tr>

  ${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};
