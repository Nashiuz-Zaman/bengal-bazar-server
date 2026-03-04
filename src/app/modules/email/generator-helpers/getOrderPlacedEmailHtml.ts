import { formatPrice } from "../../../../utils/formatPrice.js";
import { TOrderWithItems } from "../../../../types/order.js";
import {
  getEmailWrapperStart,
  emailWrapperEnd,
  getEmailHeader,
  getEmailFooter,
} from "./commonEmailParts.js";

export const getOrderPlacedEmailHtml = (order: TOrderWithItems, year: number) => {
  // 1. Map through orderItems using SNAPSHOT fields
  const itemsHtml = order.orderItems
    .map((item) => {
      // attributes is a Json field, e.g., { Color: "Red", Size: "XL" }
      const attributes = (item.attributes as Record<string, string>) || {};
      const attributeEntries = Object.entries(attributes);

      const specsHtml = attributeEntries.length
        ? `
          <h3 style="font-size:12px; color:#a439da; font-weight:700; margin:8px 0 4px 0;">
            Specifications
          </h3>
          <ul style="margin:0 0 10px 0; padding-left:5px; list-style:none; line-height:1.4;">
            ${attributeEntries
              .map(
                ([key, val]) => `
                  <li style="font-size:11px; color:#555;">
                    <strong style="text-transform: capitalize;">${key}:</strong> ${val}
                  </li>
                `
              )
              .join("")}
          </ul>
        `
        : "";

      const unitPrice = Number(item.discountSalesPrice || 0);
      const subtotal = unitPrice * item.quantity;

      return `
        <tr>
          <td>
            <table width="100%" cellpadding="15" cellspacing="0" style="border-bottom:1px solid #f0f0f0;">
              <tr>
                <td style="width:80px;" valign="top">
                  <img src="${item.image ?? ""}" alt="Product" width="70" style="border-radius:4px; border:1px solid #eee;" />
                </td>
                <td style="padding-left:0;" valign="top">
                  <p style="margin:0; font-size:14px; font-weight:700; color:#222; line-height:1.4;">
                    ${item.productName}
                  </p>
                  <p style="margin:2px 0; font-size:11px; color:#888;">SKU: ${item.sku}</p>
                  ${specsHtml}
                </td>
                <td style="width:120px; font-size:12px; line-height:1.6;" valign="top" align="right">
                  <p style="margin:0;">Qty: <strong>${item.quantity}</strong></p>
                  <p style="margin:0;">${formatPrice(unitPrice)}</p>
                  <p style="margin:5px 0 0 0; font-weight:700; color:#a439da;">${formatPrice(subtotal)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
${getEmailWrapperStart("Order Confirmed")}
  ${getEmailHeader(`Thank you, ${order.customerName}! Your order #${order.orderNumber} has been placed.`)}

  <tr>
    <td style="padding:10px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
            ${itemsHtml}
        </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px;">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13px; color:#444; background-color:#fafafa; border-radius:8px; padding:15px;">
        <tr>
          <td align="right">Subtotal:</td>
          <td align="right" width="100"><strong>${formatPrice(Number(order.subtotal))}</strong></td>
        </tr>
        <tr>
          <td align="right">Shipping Fee:</td>
          <td align="right">${formatPrice(Number(order.shippingFee))}</td>
        </tr>
        <tr>
          <td align="right">Tax:</td>
          <td align="right">${formatPrice(Number(order.tax))}</td>
        </tr>
        ${Number(order.discount) > 0 ? `
        <tr>
          <td align="right" style="color:#e11d48;">Discount:</td>
          <td align="right" style="color:#e11d48;">-${formatPrice(Number(order.discount))}</td>
        </tr>` : ""}
        <tr>
          <td colspan="2" style="border-top:1px solid #ddd; padding-top:10px;"></td>
        </tr>
        <tr>
          <td align="right" style="font-size:16px; font-weight:bold; color:#222;">Total Amount:</td>
          <td align="right" style="font-size:16px; font-weight:bold; color:#a439da;">${formatPrice(Number(order.total))}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 30px 20px; text-align:center; font-size:12px; color:#888;">
        <p>You will receive another email once your items have shipped.</p>
    </td>
  </tr>

  ${getEmailFooter(year)}
${emailWrapperEnd}
  `;
};