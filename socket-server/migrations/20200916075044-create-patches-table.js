"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("patches", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patch_batch: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("patches");
  },
};
