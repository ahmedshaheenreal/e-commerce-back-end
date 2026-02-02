"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      "SELECT product_id FROM product;",
      { type: Sequelize.QueryTypes.SELECT },
    );

    const categories = await queryInterface.sequelize.query(
      "SELECT category_id FROM category;",
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (!products.length || !categories.length) {
      throw new Error("Products or categories not found. Seed them first.");
    }

    const productCategories = [];
    const usedPairs = new Set();

    for (const product of products) {
      const shuffledCategories = [...categories]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      for (const category of shuffledCategories) {
        const key = `${product.product_id}-${category.category_id}`;
        if (usedPairs.has(key)) continue;

        usedPairs.add(key);

        productCategories.push({
          product_id: product.product_id,
          category_id: category.category_id,
        });
      }
    }

    await queryInterface.bulkInsert("product_category", productCategories);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("product_category", null, {});
  },
};
