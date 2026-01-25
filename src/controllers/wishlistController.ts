import { Request, Response } from "express";
import WishlistService from "../services/wishlistService";

export default class WishlistController {
  // Create a new wishlist item
  static async getItemIds(req: Request, res: Response) {
    const userId = (req as any).token.id;
    console.log(req.body);
    // Input validation
    if (!userId || isNaN(parseInt(userId))) {
      res.status(400).json({
        message: "Invalid userId or productId. They must be valid numbers.",
      });

      return;
    }

    try {
      const items = await WishlistService.findAllWishlistItemsId(
        parseInt(userId),
      );

      res.status(200).json(items.map((item: any) => item.product_id));
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching wishlist items.", error });
    }
  }
  static async createWishlistItem(req: Request, res: Response) {
    const { productId } = req.body;
    const userId = (req as any).token.id;
    console.log(req.body);
    // Input validation
    if (
      !userId ||
      !productId ||
      isNaN(parseInt(userId)) ||
      isNaN(parseInt(productId))
    ) {
      res.status(400).json({
        message: "Invalid userId or productId. They must be valid numbers.",
      });
      console.log("Validation Error::---WishList");
      return;
    }

    try {
      const newWishlistItem = await WishlistService.createWishlistItem(
        parseInt(userId),
        parseInt(productId),
      );

      res.status(201).json(newWishlistItem);
    } catch (error) {
      res.status(500).json({ message: "Error creating wishlist item.", error });
    }
  }

  // Get all wishlist items for a user
  static async getAllWishlistItems(req: Request, res: Response) {
    // const { userId } = req.params;
    let page = req.query.page;
    const userId = (req as any).token?.id;
    // Input validation
    if (!page || isNaN(Number(page))) {
      page = "1";
    }
    if (!userId || isNaN(parseInt(userId))) {
      res.status(400).json({
        message: "Invalid userId. It must be a valid number.",
      });
      return;
    }

    try {
      const itemIds = await WishlistService.findAllWishlistItemsId(
        parseInt(userId),
      );
      const wishlistItems = await WishlistService.findAllWishlistItems(
        parseInt(userId),
        Number(page),
      );

      res.status(200).json({
        ...wishlistItems,
        wishListItemIds: itemIds.map((item: any) => item.product_id),
      });
    } catch (error) {
      console.log(JSON.stringify(error.message));
      res
        .status(500)
        .json({ message: "Error fetching wishlist items.", error });
    }
  }

  // Remove a wishlist item
  static async deleteWishlistItem(req: Request, res: Response) {
    const { wishlistId } = req.params;
    const user_id = (req as any).token.id;
    // Input validation
    if (!wishlistId || isNaN(parseInt(wishlistId))) {
      res.status(400).json({
        message: "Invalid wishlistId. It must be a valid number.",
      });
      return;
    }

    try {
      const deleted = await WishlistService.destroyWishlistItem(
        Number(user_id),
        parseInt(wishlistId),
      );

      if (!deleted) {
        res.status(404).json({ message: "Wishlist item not found." });
        return;
      }

      res.status(200).json({ message: "Wishlist item deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error deleting wishlist item.", error });
    }
  }
}
