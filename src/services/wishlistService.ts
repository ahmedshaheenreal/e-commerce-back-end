import { Product } from "../models/ProductModel";
import { WishlistItem } from "../models/WishListItemModel";
import { User } from "../models/UserModel";
import { IncludeOptions } from "sequelize";
import { PAGINATION } from "../constants";
export default class WishlistService {
  // Create a new wishlist item
  static async createWishlistItem(userId: number, productId: number) {
    const newWishlistItem = await WishlistItem.create({
      user_id: userId,
      product_id: productId,
    });
    return newWishlistItem;
  }
  static async findAllWishlistItemsId(userId: number) {
    const wishlistItems = await WishlistItem.findAll({
      attributes: ["product_id"],
      where: { user_id: userId },
    });
    return wishlistItems;
  }
  // Find all wishlist items for a specific user
  static async findAllWishlistItems(userId: number, page: number) {
    const totalItems = await WishlistItem.count({
      where: { user_id: userId },
    });

    const products = await Product.findAll({
      include: {
        model: User,
        attributes: [],
        where: { user_id: userId },
        through: { attributes: ["wishlistItem_Id"] },
      },
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
      offset: (page - 1) * PAGINATION.DEFAULT_PAGE_SIZE,
    });
    const numberOfPages = Math.ceil(totalItems / PAGINATION.DEFAULT_PAGE_SIZE);

    // const user = await User.findByPk(userId, {
    //   attributes: ["user_id"],
    //   include: [
    //     {
    //       model: Product,
    //       through: { attributes: ["wishlistItem_Id"] },

    //       separate: true,
    //     } as IncludeOptions,
    //   ],
    //   subQuery: false,
    // });

    return {
      numberOfPages,
      count: totalItems,
      products: (products as any) ?? [],
    };
  }

  // Remove a wishlist item by user_id and product_id
  static async destroyWishlistItem(user_id: number, product_id: number) {
    const deleted = await WishlistItem.destroy({
      where: {
        user_id,
        product_id,
      },
    });
    return deleted; // Returns the number of rows deleted
  }
}
