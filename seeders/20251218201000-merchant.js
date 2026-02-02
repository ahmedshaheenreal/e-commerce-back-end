"use strict";

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash("Merchant123", 10);
    const merchants = Array.from({ length: 5 }).map((_, index) => ({
      merchant_id: index + 1, // Ensure IDs match those referenced in products
      name: faker.person.fullName(),
      email: `merchant${index + 1}@example.com`, // guaranteed unique
      password: passwordHash, // setter is NOT triggered in bulkInsert
      businessName: faker.company.name(),
      businessAddress: faker.location.streetAddress(),
      phone: faker.phone.number("##########"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("merchant", merchants);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("merchant", {
      email: {
        [Sequelize.Op.like]: "merchant%@example.com",
      },
    });
  },
};
