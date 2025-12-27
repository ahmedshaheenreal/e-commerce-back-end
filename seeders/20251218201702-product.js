"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = Array.from({ length: 20 }).map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      stock: faker.number.int({ min: 0, max: 200 }),
      merchant_id: faker.number.int({ min: 1, max: 5 }), // MUST exist
      brand_name: faker.company.name(),
      discount_percentage: faker.number.float({
        min: 0,
        max: 50,
        precision: 0.01,
      }),
      product_image_url: faker.image.url(),
      brand_image_url: faker.image.url(),
      averageRating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      NumberOfRatings: faker.number.int({ min: 0, max: 500 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("product", products);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product", null, {});
  },
};
