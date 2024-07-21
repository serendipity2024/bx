const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = function defineModels(sequelize) {
  const Patch = sequelize.define(
    "Patch",
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patch_batch: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "patches",
      timestamps: false,
      initialAutoIncrement: 1,
      // Other model options go here
    }
  );

  return {
    Patch,
  };
};
