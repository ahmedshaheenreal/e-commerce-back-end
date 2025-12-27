"use strict";

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Array.from({ length: 10 }).map(() => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number("+20##########"),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 50, mode: "age" }),
      password: bcrypt.hashSync("Password123", 10),
      address: faker.location.city(),
      profilePicture: null,
      lastPasswordChange: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("user", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user", null, {});
  },
};
