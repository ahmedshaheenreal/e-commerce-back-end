"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const categoryNames = [
      "Handbags",
      "Watches",
      "Skincare",
      "Jewellery",
      "Apparels",
    ];

    const categories = categoryNames.map((name) => ({
      name,
      description: `${name} products category`,
      image_url: "https://www.via.placeholder.com/300",
    }));

    // await queryInterface.bulkInsert("category", categories);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("category", {
      name: {
        [Sequelize.Op.in]: [
          "Handbags",
          "Watches",
          "Skincare",
          "Jewellery",
          "Apparels",
        ],
      },
    });
  },
};
