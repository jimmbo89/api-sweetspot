'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      PurchaseHistory.belongsTo(models.Person, { foreignKey: 'person_id', as: 'person' });
      PurchaseHistory.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
      PurchaseHistory.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse'  });
    }
  }
  PurchaseHistory.init(
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
      warehouse_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "warehouses", // Nombre de la tabla de people
          key: "id",
        },
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true, // Fecha actual por defecto
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Fecha actual por defecto
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unitType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PurchaseHistory",
      tableName: "purchase_histories",
      timestamps: true,
    }
  );
  return PurchaseHistory;
};