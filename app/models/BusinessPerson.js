"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BusinessPerson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BusinessPerson.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
      BusinessPerson.belongsTo(models.Person, { foreignKey: "person_id", as: "person" });
      BusinessPerson.belongsTo(models.Business, { foreignKey: "business_id", as: "business" });
    }
  }
  BusinessPerson.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que 'id' es la clave primaria
        autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
      },
      business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      person_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      pix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workplace: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,  // Se asume que 1 es el valor por defecto para el negocio propio
      },
    },
    {
      sequelize,
      modelName: "BusinessPerson",
      tableName: "business_people",
      timestamps: true
    }
  );
  return BusinessPerson;
};
