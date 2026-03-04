import { Order } from "../../../../generated/prisma/client.js";
import { sendEmail } from "../../../../lib/nodemailer.js";
import { getOrderShippedEmailHtml } from "../generator-helpers/getOrderShippedEmailHtml.js";

/**
 * Sends a shipping confirmation email once an order has been dispatched.
 * Uses the Order model fields: customerEmail, orderNumber, and customerName.
 */
export const sendOrderShippedEmail = async (
  order: Order & {
    shippingTrackingNumber?: string;
    shippingCarrier?: string;
    estimatedDelivery?: Date | string;
  },
) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    shippingTrackingNumber,
    shippingCarrier,
    estimatedDelivery,
  } = order;

  // Generate the HTML using schema-aligned variables
  const html = getOrderShippedEmailHtml({
    orderNumber,
    customerName,
    shippingTrackingNumber: shippingTrackingNumber || "N/A",
    shippingCarrier: shippingCarrier || "N/A",
    estimatedDelivery: estimatedDelivery ?? "TBD",
    year: new Date().getFullYear(),
  });

  const result = await sendEmail(
    customerEmail, // Matches 'customerEmail' in schema
    `Your Order #${orderNumber} has Shipped!`,
    html,
  );

  return !!result;
};
