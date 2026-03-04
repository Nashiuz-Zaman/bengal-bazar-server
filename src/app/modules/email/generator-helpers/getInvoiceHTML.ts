import { formatPrice } from "../../../../utils/formatPrice.js";
import { TOrderWithItems } from "../../../../types/order.js";

export const getInvoiceHTML = (order: TOrderWithItems): string => {
  const escapeHtml = (unsafe: unknown) => {
    if (unsafe === null || unsafe === undefined) return "";
    const s = String(unsafe);
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  // 1. Process items using SNAPSHOT fields
  const itemsHtml = (order.orderItems || [])
    .map((item) => {
      const unitPrice = Number(item.discountSalesPrice || 0);
      const quantity = Number(item.quantity || 0);
      const lineTotal = unitPrice * quantity;

      // Combine Product name and Variant name if it exists
      const displayName = item.variantName
        ? `${item.productName} (${item.variantName})`
        : item.productName;

      return `
        <tr>
          <td style="width:55%;">
            <div style="font-weight:bold;">${escapeHtml(displayName)}</div>
            <div style="font-size:10px; color:#666;">SKU: ${escapeHtml(item.sku)}</div>
          </td>
          <td style="width:15%;">${quantity}</td>
          <td style="width:15%;">${formatPrice(unitPrice)}</td>
          <td style="width:15%;">${formatPrice(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  // 2. Extract Totals from Decimal fields
  const subtotal = Number(order.subtotal || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total || 0);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Invoice - ${order.orderNumber}</title>
    <style>
      * { font-family: Arial, sans-serif; margin: 0; box-sizing: border-box; }
      body { margin: 0; padding: 40px; background-color: #ffffff; font-size: 12px; color: #333; width: 210mm; height: 297mm; display: flex; flex-direction: column; }
      .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 50px; }
      .invoice-id { font-weight: bold; font-size: 14px; color: #222; }
      h2 { margin: 0; margin-bottom: 15px; color: #16a34a; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { text-align: left; padding: 12px 8px; font-size: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
      th { background-color: #f9fafb; border-top: 1px solid #ddd; }
      .totals-table td { border: none; padding: 4px 8px; }
      .store-info { text-align: right; font-size: 11px; color: #444; line-height: 1.4; }
      .customer-info { margin-bottom: 30px; font-size: 12px; line-height: 1.5; }
      .signature-section { margin-top: auto; text-align: right }
      .footer-note { margin-top: 50px; font-size: 10px; color: #777; text-align: center; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="header">
      <div style="font-size:32px; font-weight:bold; color:#a439da;">Bengal Bazar</div>
      <div class="store-info">
        <div style="font-weight:bold; font-size:14px;">Bengal Bazar Ltd.</div>
        Dhaka, Bangladesh<br />
        support@bengalbazar.com
      </div>
    </div>

    <div style="display: flex; justify-content: space-between;">
       <div class="customer-info">
        <strong style="color:#666; text-transform:uppercase; font-size:10px;">Bill To:</strong><br />
        <span style="font-size:14px; font-weight:bold;">${escapeHtml(order.customerName)}</span><br />
        ${escapeHtml(order.customerEmail)}<br />
        ${escapeHtml(order.customerPhone || "")}
      </div>
      <div class="invoice-id">
        <span style="color:#666; font-weight:normal;">Order ID:</span> #${escapeHtml(order.orderNumber)}
      </div>
    </div>

    <h2>Order Confirmation</h2>
    <p>Thank you for your purchase! Your order is confirmed.</p>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end; margin-top:30px;">
      <table class="totals-table" style="width:250px;">
        <tr><td>Sub Total:</td><td align="right">${formatPrice(subtotal)}</td></tr>
        <tr><td>Shipping Fee:</td><td align="right">${formatPrice(shippingFee)}</td></tr>
        <tr><td>Tax:</td><td align="right">${formatPrice(tax)}</td></tr>
        <tr><td>Discount:</td><td align="right" style="color:red;">-${formatPrice(discount)}</td></tr>
        <tr style="font-size:16px; font-weight:bold;"><td style="padding-top:10px;">Total:</td><td align="right" style="padding-top:10px;">${formatPrice(total)}</td></tr>
      </table>
    </div>

    <div class="signature-section">
      <p style="margin-bottom:40px; font-size:11px; color:#444;">Signed by,</p>
      <p style="font-weight:bold;">Nashiuz Zaman</p>
      <div style="font-size:11px; color:#777;">Authorized Representative</div>
    </div>

    <div class="footer-note">
      <p>This is a computer-generated invoice. No signature is required. <br/> 
      Warranty is subject to terms and conditions of Bengal Bazar.</p>
    </div>
  </body>
</html>`;
};
