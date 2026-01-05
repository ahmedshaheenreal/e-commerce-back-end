import { Router } from "express";
import cartController from "../controllers/cartController";
import { verifyToken } from "../utils/verifyToken";
const cartRouter = Router();

// Route to add an item to the cart
cartRouter.post("/", cartController.addItemToCart);

// Route to get all cart items for a user
cartRouter.get("/", verifyToken, cartController.getUserCart);

// Route to update the quantity of a cart item
cartRouter.put("/:cartItemId", verifyToken, cartController.updateCartItem);

// Route to remove a cart item by cartItemId
cartRouter.delete("/:cartItemId", verifyToken, cartController.removeCartItem);

export default cartRouter;
