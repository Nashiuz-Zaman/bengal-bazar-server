import { sendEmail } from "../../../../libs/nodemailer.js";
import { TOrderWithItems } from "../../../../types/order.js";
import { getOrderPlacedEmailHtml } from "../generator-helpers/getOrderPlacedEmailHtml.js";

export const sendOrderPlacedEmail = async (
  order: TOrderWithItems,
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  },
) => {
  // Pass the whole order object to the HTML generator
  const html = getOrderPlacedEmailHtml(order, new Date().getFullYear());

  const result = await sendEmail(
    order.customerEmail, // Matches schema field
    `Order Placed – #${order.orderNumber}`, // User-friendly identifier
    html,
    undefined,
    attachment ? [attachment] : undefined,
  );

  return !!result;
};
