'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Warehouse.belongsTo(models.Business, { foreignKey: "business_id", as: "business" });
      Warehouse.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    }
  }
  Warehouse.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Indica que 'id' es la clave primaria
      autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,  
      allowNull: true,       
    },
    measure: {
      type: DataTypes.STRING,  
      allowNull: true,       
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    image: {
      type: DataTypes.STRING,  
      allowNull: true,       
    }
  }, {
    sequelize,
    modelName: 'Warehouse',
    tableName: 'warehouses',
    timestamps: true
  });
  return Warehouse;
};