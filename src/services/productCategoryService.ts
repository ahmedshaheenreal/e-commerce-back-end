// Import the constants
import { FIELD_NAMES, PAGINATION } from "../constants";

// Import product service
import { productService } from "./productService";

// Import Sequelize instance
import { sequelize } from "../config/db";
import { QueryTypes } from "sequelize";
import { Category } from "../models/CategoryModel";
import { Product } from "../models/ProductModel";
import { Op } from "sequelize";
export class Custom404Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Custom404Error";
  }
}
export class productCategoryService {
  // This function to get all products that belongs to category based on pagination
  static async getProductsBelongsToCategory(
    category_id: number,
    page_number: number,
  ) {
    const query = `
  SELECT 
    p.product_id,
    p.name,
    p.price,
    p.brand_name,
    p.discount_percentage,
    p.product_image_url,
    p."averageRating",
    p."NumberOfRatings",
    (SELECT COUNT(*) 
     FROM product_category pc 
     WHERE pc.category_id = :categoryId) AS "totalCount"
  FROM product p
  JOIN product_category pc ON p.product_id = pc.product_id
  WHERE pc.category_id = :categoryId
  LIMIT :limit OFFSET :offset;
`;

    const products: any = await sequelize.query(query, {
      replacements: {
        categoryId: category_id,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
        offset: (page_number - 1) * PAGINATION.DEFAULT_PAGE_SIZE,
      },
      type: QueryTypes.SELECT,
    });
    const result: any = {};

    if (products.length !== 0) {
      if (
        products[0][FIELD_NAMES.TOTAL_COUNT] % PAGINATION.DEFAULT_PAGE_SIZE ===
        0
      ) {
        result.number_of_pages = Math.floor(
          products[0][FIELD_NAMES.TOTAL_COUNT] / PAGINATION.DEFAULT_PAGE_SIZE,
        );
      } else {
        result.number_of_pages =
          Math.floor(
            products[0][FIELD_NAMES.TOTAL_COUNT] / PAGINATION.DEFAULT_PAGE_SIZE,
          ) + 1;
      }
      for (const product of products) {
        productService.addDiscountInfo(product);
      }
      result.products = products;
    }
    return result;
  }

  // This function to get all products that are related to specific product
  static async getProductsRelatedToProduct(
    category_id: number,
    product_id: number,
  ) {
    const query = `
    SELECT p.product_id, p.name, p.price, p.brand_name, p.discount_percentage, p.product_image_url, p."averageRating",p."NumberOfRatings"
    FROM product p
    JOIN product_category pc ON p.product_id = pc.product_id
    WHERE pc.category_id = :categoryId AND pc.product_id != :productId
    LIMIT :limit;
  `;

    const products: any = await sequelize.query(query, {
      replacements: {
        categoryId: category_id,
        productId: product_id,
        limit: PAGINATION.RELATED_PRODUCT_PAGE_SIZE,
      },
      type: QueryTypes.SELECT,
    });
    for (const product of products) {
      productService.addDiscountInfo(product);
    }
    return products;
  }

  static async handPickedService(category_id: number, page: number) {
    const categoryProducts = await Product.findAndCountAll({
      raw: true,
      where: {
        price: {
          [Op.lt]: 100,
        },
        averageRating: {
          [Op.gte]: 4.5,
        },
      },
      include: [
        {
          model: Category,
          attributes: ["category_id", "name"],
          through: { attributes: [] },
          where: {
            category_id,
          },
        },
      ],
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
      offset: (page - 1) * PAGINATION.DEFAULT_PAGE_SIZE,
    });

    const numberOfPages = Math.ceil(categoryProducts.count / 9);

    if (numberOfPages < page) {
      throw new Custom404Error("page not found");
    }
    for (const product of categoryProducts.rows) {
      productService.addDiscountInfo(product);
    }
    return {
      count: categoryProducts.count,
      numberOfPages,
      products: categoryProducts.rows,
    };
  }

  static async getCategoryList(imagesIncluded: boolean) {
    if (imagesIncluded) {
      const categoreis = await Category.findAll({
        raw: true,
      });
      return categoreis;
    } else {
      const categoreis = await Category.findAll({
        raw: true,
        attributes: ["category_id", "name"],
      });
      return categoreis;
    }
  }
}
