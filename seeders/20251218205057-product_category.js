"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch existing product IDs
    const products = await queryInterface.sequelize.query(
      "SELECT product_id FROM product;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Fetch existing category IDs
    const categories = await queryInterface.sequelize.query(
      "SELECT category_id FROM category;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!products.length || !categories.length) {
      throw new Error("Products or categories not found. Seed them first.");
    }

    const productCategories = [];

    // Assign 1–3 random categories per product
    for (const product of products) {
      const shuffledCategories = categories
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      for (const category of shuffledCategories) {
        productCategories.push({
          product_id: product.product_id,
          category_id: category.category_id,
        });
      }
    }

    await queryInterface.bulkInsert("product_category", productCategories);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_category", null, {});
  },
};
