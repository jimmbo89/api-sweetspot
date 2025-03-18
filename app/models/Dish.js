"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Un plato pertenece a un negocio
      Dish.belongsTo(models.Business, {
        foreignKey: "business_d",
        as: "business",
      });

      // Un plato pertenece a una persona
      Dish.belongsTo(models.Person, {
        foreignKey: "person_id",
        as: "person",
      });
    }
  }
  Dish.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que 'id' es la clave primaria
        autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
      },
      business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "businesses", // Nombre de la tabla de businesses
          key: "id",
        },
      },
      person_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "people", // Nombre de la tabla de people
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Dish",
      tableName: "dishes",
      timestamps: true,
      paranoid: true, // Habilita el soft delete
      scopes: {
        withDeleted: {
          paranoid: false, // Scope personalizado para incluir eliminados
        },
      },
    }
  );
  return Dish;
};
