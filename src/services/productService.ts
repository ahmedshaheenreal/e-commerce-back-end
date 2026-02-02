// Import the constants
import { CONSTANTS, FIELD_NAMES, PAGINATION, RATING } from "../constants";

// Import product model
import { Product } from "../models/ProductModel";

// Import category service
import { categoryService } from "../services/categoryService";

// Import productCategory service
import { productCategoryService } from "../services/productCategoryService";

// Import Sequelize and Op from sequelize module
import { Op, Sequelize } from "sequelize";

import { OrderItem } from "../models/OrderItem";
import { CartItem } from "../models/CartItemModel";
import { Category } from "../models/CategoryModel";
import { User } from "../models/UserModel";

export class productService {
  // This method to add discount information to product information
  static addDiscountInfo(productInfo: any) {
    if (productInfo.discount_percentage === CONSTANTS.DISCOUNT_ZERO) {
      productInfo.price_after_discount = null;
      return;
    }
    const discountValue =
      productInfo.price * (productInfo.discount_percentage / 100);
    productInfo.price_after_discount = productInfo.price - discountValue;

    productInfo.price_after_discount = parseFloat(
      productInfo.price_after_discount.toFixed(CONSTANTS.DISCOUNT_PRECISION),
    );
  }
  // Method to retrieve new arrival products with optional limit
  static async getNewArrivalsProducts(limit?: number, page?: number) {
    const currentDate = new Date();

    // Calculate the start date of the previous three months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    try {
      // Fetch products created within the last three months
      const queryOptions: any = {
        where: {
          createdAt: {
            [Op.between]: [threeMonthsAgo, currentDate],
          },
        },
        raw: true,
      };

      // Add limit if provided
      if (limit !== undefined) {
        queryOptions.limit = limit;
        queryOptions.offset = page !== undefined ? (page - 1) * limit : 0;
      }

      // Fetch products
      const newProducts: any[] = await Product.findAll(queryOptions);
      const totalCount: number = await Product.count({
        where: {
          createdAt: {
            [Op.between]: [threeMonthsAgo, currentDate],
          },
        },
      });
      // Process products and clean up fields
      newProducts.forEach((product) => {
        this.addDiscountInfo(product); // Add discount info
      });

      return {
        products: newProducts,
        totalCount,
        numberOfPages: Math.ceil(totalCount / (limit || 9)),
      };
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
    }
  }

  // This method to get all products that matched user search
  static async findProductsByText(text: string, page?: number) {
    const { count, rows: products }: any = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          {
            brand_name: {
              [Op.like]: `%${text}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${text}%`,
            },
          },
        ],
      },
      attributes: [
        "product_id",
        "name",
        "price",
        "brand_name",
        "discount_percentage",
        "product_image_url",
        "averageRating",
        "NumberOfRatings",
      ],
      raw: true,
      offset: page && page > 0 ? (page - 1) * PAGINATION.DEFAULT_PAGE_SIZE : 0,
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
    });
    for (const product of products) {
      this.addDiscountInfo(product);
    }
    return {
      products,
      count,
      numberOfPages: Math.ceil(count / PAGINATION.DEFAULT_PAGE_SIZE),
    };
  }
  // This method to get a specific product based on id
  static async findProductById(product_id: number) {
    const product: any = await Product.findByPk(product_id, {
      include: [
        {
          model: Category,
          through: { attributes: [] },
          attributes: ["category_id", "name", "description"],
        },
      ],
      attributes: [
        "product_id",
        "name",
        "description",
        "price",
        "stock",
        "brand_name",
        "discount_percentage",
        "product_image_url",
        "averageRating",
        "NumberOfRatings",
      ],
    });
    if (product === null) {
      return null;
    }
    this.addDiscountInfo(product.dataValues);

    return product;
  }
  // This method to get all products that belongs to category
  static async findProductsByCategory(
    categoryName: string,
    pageNumber: number,
  ) {
    const categoryInfo: any =
      await categoryService.getCategoryByName(categoryName);
    if (!categoryInfo) {
      return {};
    }
    const products: any =
      await productCategoryService.getProductsBelongsToCategory(
        categoryInfo.category_id,
        pageNumber,
      );
    return products;
  }
  // This method to get products that related to specific product
  static async getRelatedProducts(categoryName: string, product_id: number) {
    const categoryInfo: any =
      await categoryService.getCategoryByName(categoryName);
    if (!categoryInfo) {
      return [];
    }
    const products: any =
      await productCategoryService.getProductsRelatedToProduct(
        categoryInfo.category_id,
        product_id,
      );
    return products;
  }
  // This method to get all brands
  static async getBrandsService() {
    const brands = await Product.findAll({
      attributes: ["brand_image_url", "brand_name"],
      group: ["brand_name", "brand_image_url"],
    });
    console.log(brands);
    return brands.map((e: any) => e.dataValues);
  }

  //check stock availabilty
  static async checkStock(product_id: number, quantity: number) {
    const product = await Product.findOne({
      where: { product_id },
    });

    //check if product exist
    if (!product) {
      throw new Error("Product not found");
    }
    console.log(product.dataValues.stock, "quantity: " + quantity);
    if (product.dataValues.stock >= quantity) return true;

    return false;
  }
  //update the stock
  static async updateStock(
    product_id: number,
    quantity: number,
    operation: string,
  ) {
    try {
      const product = await Product.findOne({
        where: { product_id },
      });

      //check if product exist
      if (!product) {
        throw new Error("Product not found");
      }
      if (operation === "sub") {
        product.dataValues.stock -= quantity;
      } else {
        product.dataValues.stock += quantity;
      }
    } catch (error) {
      return { status: 500, response: error };
    }
  }

  static async getCartProducts(user_id: number) {
    const cartItems = await Product.findAll({
      include: [
        {
          model: CartItem,
          where: { user_id },
          attributes: ["quantity"],
        },
      ],
    });
    return cartItems;
  }
  static async getOrderProducts(order_id: number, user_id?: number) {
    console.log("order id in service: ", order_id);
    try {
      const products = await Product.findAll({
        include: [
          {
            model: OrderItem,
            where: { order_id },
            attributes: [
              "quantity",
              [
                Sequelize.literal(
                  "quantity*price*((100  - discount_percentage)/100)",
                ),
                "grandtotal",
              ],
              [Sequelize.literal("quantity*price"), "subtotal"],
            ],
          },
          {
            model: User,
            attributes: ["firstName", "lastName", "phone", "address"],
            where: { user_id },
            through: { attributes: [] }, // Disable through table attributes
            required: false, // Make it optional join
          },
        ],
        attributes: [
          "discount_percentage",
          "price",
          "name",
          "brand_name",
          "product_id",
          "product_image_url",
        ],
        subQuery: false, // Prevent subquery that causes issues with associations
      });

      console.log("order products: ", products);
      for (const product of products) {
        this.addDiscountInfo(product.dataValues);
      }

      return products;
    } catch (error) {
      return { status: 500, response: error };
    }
  }
}

export const getProductByBrand = async (brand: string, page: number) => {
  try {
    console.log("brand in service: ", brand);
    const { rows: products, count } = await Product.findAndCountAll({
      where: {
        brand_name: `${brand.replace(/-/g, " ")}`,
      },
      limit: 12,
      offset: page && page > 0 ? (page - 1) * 12 : 0,
    });
    console.log("products before adding discount info: ", products);

    for (const product of products) {
      productService.addDiscountInfo(product.dataValues);
    }
    console.log("products by brand: ", products);
    return {
      status: 200,
      products: products,
      count,
      numberOfPages: Math.ceil(count / 12),
    };
  } catch (error) {
    return { status: 500, error };
  }
};

export const createProduct = async (product: any) => {
  try {
    const newProduct = await Product.create(product);
    return { status: 201, response: newProduct };
  } catch (error) {
    return { status: 500, response: error };
  }
};
