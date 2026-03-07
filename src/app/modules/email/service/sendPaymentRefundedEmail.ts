import { sendEmail } from "../../../../libs/nodemailer.js";
import { formatPrice } from "../../../../utils/formatPrice.js";
import { prismaInstance } from "../../../../libs/prisma.js";
import { Transaction } from "../../../../generated/prisma/client.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { getRefundProcessedEmailHtml } from "../generator-helpers/getRefundProcessedEmailHtml.js";

/**
 * Sends a refund confirmation email to the customer.
 * Uses the Transaction and Order models to pull accurate refund data.
 */
export const sendPaymentRefundedEmail = async (
  financialTransaction: Transaction,
) => {
  // 1. Fetch the associated order to get the orderNumber
  const order = await prismaInstance.order.findUnique({
    where: { id: financialTransaction.orderId },
    select: { orderNumber: true },
  });

  if (!order) {
    throw ApiError.NotFound("Order associated with this refund not found");
  }

  // 2. Prepare the HTML content
  // Note: Using refundAmount for the price display, fallback to base amount
  const html = getRefundProcessedEmailHtml(
    order.orderNumber,
    financialTransaction.customerName,
    formatPrice(
      Number(financialTransaction.refundAmount || financialTransaction.amount),
    ),
    financialTransaction.refundReason || "Refund processed by admin",
    new Date().getFullYear(),
  );

  // 3. Dispatch the email
  const result = await sendEmail(
    financialTransaction.customerEmail,
    `Refund Processed – Order #${order.orderNumber}`,
    html,
  );

  return !!result;
};
