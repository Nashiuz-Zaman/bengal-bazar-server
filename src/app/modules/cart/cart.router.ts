import { Router } from "express";
import {
  getCartController,
  addItemToCartController,
  updateCartItemQtyController,
  removeItemFromCartController,
  clearCartController,
} from "./cart.controller.js";
import { optionalProtect } from "../../middlewares/optionalProtect.js";

const cartRouter = Router();

/**
 * All cart routes use optionalAuth to check for a logged-in user
 * without forcing a login (allowing guest checkout logic).
 */
cartRouter.use(optionalProtect);

// 1. Get current cart (handles merge/takeover logic)
cartRouter.get("/", getCartController);

// 2. Add item to cart (creates cart if missing)
cartRouter.post("/items", addItemToCartController);

// 3. Update quantity of a specific item
cartRouter.patch("/items/:itemId", updateCartItemQtyController);

// 4. Remove a specific item from cart
cartRouter.delete("/items/:itemId", removeItemFromCartController);

// 5. Clear the entire cart
cartRouter.delete("/", clearCartController);

export { cartRouter };
