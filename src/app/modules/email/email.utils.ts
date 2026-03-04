import { formatPrice } from "../../../utils/formatPrice.js";
import { TOrderWithItems } from "../../../types/order.js";

/**
 * Transforms an Order with its nested items for Email templates.
 * Uses snapshot fields from OrderItem for historical accuracy.
 */
export const transformOrderForEmail = (order: TOrderWithItems) => {
  const items = order.orderItems.map((item) => {
    return {
      title: item.variantName || item.productName || "Product",
      quantity: item.quantity,
      price: formatPrice(Number(item.discountSalesPrice || 0)),
      specs: (item.attributes as Record<string, string>) || {},
    };
  });

  return {
    orderNumber: order.orderNumber,
    email: order.customerEmail,
    name: order.customerName,
    items: items,
    subtotal: formatPrice(Number(order.subtotal || 0)),
    total: formatPrice(Number(order.total || 0)),
    discount: formatPrice(Number(order.discount || 0)),
    tax: formatPrice(Number(order.tax || 0)),
    shippingFee: formatPrice(Number(order.shippingFee || 0)),
    couponCode: order.couponCode,
  };
};
