import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";
import { Merchant } from "./MerchantModel";

// Create a PRODUCTS Schema
export const Product = sequelize.define(
  "product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Merchant, // Reference to Merchants table
        key: "merchant_id",
      },
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    product_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    brand_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: "averageRating", // exact DB column
    },
    NumberOfRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "NumberOfRatings", // exact DB column (case-sensitive)
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "product",
    timestamps: true, // Automatically creates `createdAt` and `updatedAt` fields
  },
);
