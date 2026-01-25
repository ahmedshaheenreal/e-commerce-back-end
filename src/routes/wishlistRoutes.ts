import { Router } from "express";
import wishlistController from "../controllers/wishlistController";
import { verifyToken } from "../utils/verifyToken";

const router = Router();

// Route to create a new wishlist item
router.post("/", verifyToken, wishlistController.createWishlistItem);

// Route to get all wishlist items for a user
router.get("/", verifyToken, wishlistController.getAllWishlistItems);
router.get("/ids", verifyToken, wishlistController.getItemIds);
// Route to delete a wishlist item by wishlistId
router.delete(
  "/:wishlistId",
  verifyToken,
  wishlistController.deleteWishlistItem,
);

export default router;
