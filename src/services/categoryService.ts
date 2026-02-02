// Import category model
import { Op } from "sequelize";
import { Category } from "../models/CategoryModel";

export class categoryService {
  // This function to get a specific category based on name
  static async getCategoryByName(categoryName: string) {
    return await Category.findOne({
      where: {
        name: { [Op.iLike]: categoryName },
      },
      raw: true,
    });
  }
}
