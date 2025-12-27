// Import Request and Response from express module
import { Request, Response } from "express";

// Import services
import {
  productService,
  createProduct,
  getProductByBrand,
} from "../services/productService";

import JOI from "joi";
import { productCategoryService } from "../services/productCategoryService";

//validate product brand name
const schema = JOI.object({
  brandName: JOI.string().required(),
});
import { Custom404Error } from "../services/productCategoryService";
import { count } from "console";
// Joi validation schema for product id property
const productIdSchema = JOI.number().integer().min(1);

const productSchema = JOI.object({
  name: JOI.string().trim().min(2).max(100).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters",
    "string.max": "Product name cannot exceed 100 characters",
  }),

  description: JOI.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Product description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 1000 characters",
  }),

  price: JOI.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "number.precision": "Price cannot have more than 2 decimal places",
  }),

  stock: JOI.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be a whole number",
    "number.min": "Stock cannot be negative",
  }),

  brand_name: JOI.string().trim().min(2).max(50).required().messages({
    "string.empty": "Brand name is required",
    "string.min": "Brand name must be at least 2 characters",
    "string.max": "Brand name cannot exceed 50 characters",
  }),

  merchant_id: JOI.number().integer().positive().required().messages({
    "number.base": "Merchant ID must be a number",
    "number.integer": "Merchant ID must be a whole number",
    "number.positive": "Merchant ID must be positive",
  }),
});

export const getProductsByBrand = async (req: Request, res: Response) => {
  const { error } = schema.validate(req.params);
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const brand = req.params.brandName;
  const result = await getProductByBrand(brand, page);
  const { status, products } = result;
  res.status(status).json(result);
};

export const createProductController = async (req: Request, res: Response) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const product = req.body;
  const result = await createProduct(product);
  const { status, response } = result;
  res.status(status).json(response);
};

// Retrieve all new arrivals products
export const getAllNewArrivalsProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  const products = await productService.getNewArrivalsProducts(
    9,
    Number(req.query.page) || 1
  );
  res.status(200).json(products);
};

// Retrieve only 4 new arrivals products
export const getNewArrivalsProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  const products = await productService.getNewArrivalsProducts(4);
  res.status(200).json(products);
};

// Retrieve all products where either the product brand or the product name contains the keyword entered by the user
export const findProductsByText = async (
  req: Request,
  res: Response
): Promise<any> => {
  const text = req.params.text;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const products = await productService.findProductsByText(text, page);
  res.status(200).json(products);
};

// Retrieve a specific product based on product id
export const findProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  // Validate product id using Joi
  const { error: err } = productIdSchema.validate(req.params.id);
  if (err) {
    return res
      .status(400)
      .json({ message: "Product id must be a positive integer" });
  }
  const productID = Number(req.params.id);
  const product = await productService.findProductById(productID);
  if (product === null) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
};

// Retrieve all products that are related to category
export const findProductsByCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  // Validate page number using Joi
  if (!req.query.page) {
    req.query.page = "1";
  }
  const { error: err } = productIdSchema.validate(Number(req.query.page));
  if (err) {
    return res.status(400).json({
      message: "Page number should be positive integer number",
    });
  }
  const pageNumber = Number(req.query.page);
  const categoryName = req.params.category;
  const products = await productService.findProductsByCategory(
    categoryName,
    pageNumber
  );
  res.status(200).json(products);
};

// Retrieve related products for specfic product
export const getRelatedProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  // Validate product id using Joi
  const { error: err } = productIdSchema.validate(req.params.productId);
  if (err) {
    return res.status(400).json({
      message: "product id should be positive integer number",
    });
  }
  const product_id = Number(req.params.productId);
  const categoryName = req.params.category;
  const products = await productService.getRelatedProducts(
    categoryName,
    product_id
  );
  res.status(200).json(products);
};

//Retrieve brands list
export const getBrands = async (req: Request, res: Response): Promise<any> => {
  try {
    const brands = await productService.getBrandsService();
    if (brands.length === 0) {
      res.status(404).json({ message: "No brands found" });
      return;
    }
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Database Error",
    });
  }
};

//handpicked products

export const getHandPicked = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const category_id = parseInt(req.params.categoryId);
    const page = parseInt(req.query.page?.toString() || "") || 1;

    if (!page || !category_id) {
      res.status(400).json({
        success: false,
        massage: "please provide valid category or page",
      });
      return;
    }
    const handPicked = await productCategoryService.handPickedService(
      category_id,
      page
    );

    res.status(200).json(handPicked);
  } catch (error) {
    if (error instanceof Custom404Error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal Database Error",
    });
  }
};

//handpicked collection list:

export const getHandpickedCollectionList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const handpickedCollectionList =
      await productCategoryService.getCategoryList(true);
    res.status(200).json(handpickedCollectionList);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
