import { sequelize } from "../config/db";
import { Sequelize, DataTypes } from "sequelize";
import { User } from "./UserModel";
import { Product } from "./ProductModel";

// Define the Rating model
export const Rating = sequelize.define(
  "Rating",
  {
    rating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "product_id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "rating",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "product_id"],
      },
    ],
  },
);

const updateProductRatings = async (product_id: number) => {
  const result = await Rating.findAll({
    where: { product_id },
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("rating")), "averageRating"],
      [Sequelize.fn("COUNT", Sequelize.col("rating_id")), "NumberOfRatings"],
    ],
    raw: true,
  });

  const { averageRating, NumberOfRatings } = result[0] as Record<string, any>;
  console.log(NumberOfRatings);
  await Product.update(
    {
      averageRating: parseFloat(averageRating) || 0,
      NumberOfRatings: parseInt(NumberOfRatings) || 0,
    },
    { where: { product_id } },
  );
};

Rating.addHook("afterCreate", async (rating, options) => {
  await updateProductRatings(rating.dataValues.product_id);
});

Rating.addHook("afterUpdate", async (rating, options) => {
  await updateProductRatings(rating.dataValues.product_id);
});

Rating.addHook("afterDestroy", async (rating, options) => {
  await updateProductRatings(rating.dataValues.product_id);
});
