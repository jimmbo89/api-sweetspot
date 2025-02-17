'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.hasMany(models.Warehouse, {
        foreignKey: "product_id",
        as: "warehouses",
        onDelete: "CASCADE",
      });
    }
  }
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,    // <--- ¡Esto falta!
      autoIncrement: true  // Si es autoincremental
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  });
  return Product;
};