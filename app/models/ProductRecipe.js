'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductRecipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductRecipe.belongsTo(models.Product, { foreignKey: 'product_id' });
      ProductRecipe.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
      ProductRecipe.belongsTo(models.Business, { foreignKey: 'business_id' });
      ProductRecipe.belongsTo(models.Person, { foreignKey: 'person_id' });
    }
  }
  ProductRecipe.init({
    product_id: DataTypes.INTEGER,
    recipe_id: DataTypes.INTEGER,
    business_id: DataTypes.INTEGER,
    person_id: DataTypes.INTEGER,
    cant: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'ProductRecipe',
  });
  return ProductRecipe;
};