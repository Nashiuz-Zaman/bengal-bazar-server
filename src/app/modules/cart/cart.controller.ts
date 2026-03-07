import { RequestHandler } from "express";
import { sendSuccess } from "../../../utils/sendSuccess.js";
import { IAuthSecureRequest } from "../../../types/generic.js";
import { cleanCookie, setCookie } from "../../../utils/cookie.js";
import { getCart } from "./service/cart.query.service.js";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQty,
} from "./service/cart.item.service.js";

import { resolveCartId } from "./service/cart.query.service.js";
import { clearCart } from "./service/cart.action.service.js";
import { getParam } from "../../../utils/expressParams.js";

export const getCartController: RequestHandler = async (
  req: IAuthSecureRequest,
  res,
) => {
  // merge/takeover/fetch logic
  const { cart, clearCookie } = await getCart(
    req.decoded?.userId,
    req.cookies?.cartId,
  );

  // 2. If the service signaled a merge or takeover, clear the guest cookie
  if (clearCookie) cleanCookie(res, "cartId");

  // 3. Send the success response
  return sendSuccess(res, {
    message: "Cart retrieved successfully",
    data: { cart },
  });
};

export const addItemToCartController: RequestHandler = async (
  req: IAuthSecureRequest,
  res,
) => {
  const { variantId, quantity } = req.body;
  const userId = req.decoded?.userId;
  const cartId = req.cookies?.cartId;

  const { cartData, cartType, isNewCart } = await addItemToCart(
    variantId,
    quantity,
    cartId,
    userId,
  );

  // If a new guest cart was created, give the ID to the client via cookie
  if (cartData && isNewCart && cartType === "guest") {
    setCookie(res, { cookieName: "cartId", cookieContent: cartData?.id });
  }

  return sendSuccess(res, {
    message: "Added to cart",
    data: { cart: cartData },
  });
};

export const updateCartItemQtyController: RequestHandler = async (
  req: IAuthSecureRequest,
  res,
) => {
  const itemId = getParam(req.params.itemId);
  const { quantity } = req.body;
  const cartId = await resolveCartId(req.decoded?.userId, req.cookies?.cartId);

  const cartData = await updateCartItemQty(cartId!, itemId, quantity);

  return sendSuccess(res, {
    message: "Cart updated",
    data: { cart: cartData },
  });
};

export const removeItemFromCartController: RequestHandler = async (
  req: IAuthSecureRequest,
  res,
) => {
  const itemId = getParam(req.params.itemId);
  const cartId = await resolveCartId(req.decoded?.userId, req.cookies?.cartId);

  const cartData = await removeItemFromCart(cartId!, itemId);

  return sendSuccess(res, {
    message: "Item removed from cart",
    data: { cart: cartData },
  });
};

export const clearCartController: RequestHandler = async (
  req: IAuthSecureRequest,
  res,
) => {
  const cartId = await resolveCartId(req.decoded?.userId, req.cookies?.cartId);

  const emptyCart = await clearCart(cartId as string);
  // Always clear the guest cookie when the cart is explicitly emptied
  cleanCookie(res, "cartId");

  return sendSuccess(res, {
    message: "Cart cleared successfully",
    data: { cart: emptyCart },
  });
};
