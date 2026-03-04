import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

interface IOrderShippedProps {
  orderNumber: string;
  customerName: string;
  shippingTrackingNumber: string;
  shippingCarrier: string;
  estimatedDelivery: Date | string;
  year: number;
}

export const getOrderShippedEmailHtml = ({
  orderNumber,
  customerName,
  shippingTrackingNumber,
  shippingCarrier,
  estimatedDelivery,
  year,
}: IOrderShippedProps): string => {
  let formattedDelivery: string;

  if (typeof estimatedDelivery === "object") {
    formattedDelivery = estimatedDelivery.toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } else {
    formattedDelivery = estimatedDelivery;
  }

  return `
  ${getEmailWrapperStart("Your Order Has Shipped")}
  ${getEmailHeader("Exciting news — your order is on the way!")}
  
  <tr>
    <td style="padding:30px; color:#374151; font-size:16px; line-height:1.5;">
      <p style="margin:0 0 10px 0;">Hi <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 20px 0;">
        Great news! Your order <strong>#${orderNumber}</strong> has been handed over to our shipping partner and is making its way to you.
      </p>

      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        width="100%"
        style="margin:20px 0; background:#f3f0ff; border:1px solid #e9d5ff; border-radius:8px;"
      >
        <tr>
          <td style="padding:20px;">
            <p style="margin:0 0 10px 0; font-weight:700; color:#6b21a8; font-size:14px; text-transform:uppercase;">
              Shipping Information
            </p>
            <p style="margin:0; font-size:14px;">Carrier: <strong>${shippingCarrier}</strong></p>
            <p style="margin:4px 0; font-size:14px;">Tracking ID: <strong>${shippingTrackingNumber}</strong></p>
            <p style="margin:0; font-size:14px;">Expected Delivery: <strong>${formattedDelivery}</strong></p>
          </td>
        </tr>
      </table>

      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        align="center"
        style="margin:35px auto 35px auto;"
      >
        <tr>
          <td align="center" bgcolor="#a439da" style="border-radius:6px;">
            <a
              href="https://tracking-link-here.com/${shippingTrackingNumber}"
              target="_blank"
              style="display:inline-block; padding:16px 36px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; background-color:#a439da; border-radius:6px;"
            >
              Track My Order
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:30px 0 0 0; font-size:14px; color:#6b7280; text-align:center; font-style:italic;">
        Thank you for shopping with Bengal Bazar. We hope you love your new items!
      </p>
    </td>
  </tr>

  ${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};
