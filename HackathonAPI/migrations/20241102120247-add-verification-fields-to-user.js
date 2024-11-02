'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
      await queryInterface.addColumn('Users', 'isVerified', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
      });
      await queryInterface.addColumn('Users', 'verificationCode', {
          type: Sequelize.STRING,
          allowNull: true,
      });
  },

  async down(queryInterface, Sequelize) {
      await queryInterface.removeColumn('Users', 'isVerified');
      await queryInterface.removeColumn('Users', 'verificationCode');
  }
};

