'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DishRecipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      DishRecipe.belongsTo(models.Dish, { foreignKey: "dish_id", as: "dish" });
      DishRecipe.belongsTo(models.Recipe, { foreignKey: "recipe_id", as: "recipe" });
      DishRecipe.belongsTo(models.Business, { foreignKey: "business_id", as: "business" });
      DishRecipe.belongsTo(models.Person, { foreignKey: "person_id", as: "person" });
    }
  }
  DishRecipe.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que 'id' es la clave primaria
        autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
      },
      dish_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      person_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: DataTypes.INTEGER,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "DishRecipe",
      tableName: "dish_recipes",
      timestamps: true,
    }
  );
  return DishRecipe;
};