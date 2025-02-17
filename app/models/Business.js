"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Business.hasMany(models.Business, {
        foreignKey: "parent_id",
        as: "children",
        onDelete: "CASCADE",
      });

      Business.belongsTo(models.Business, {
        foreignKey: "parent_id",
        as: "parent",
      });

      Business.belongsToMany(models.Person, {
        through: models.BusinessPerson,
        foreignKey: 'business_id',    // La clave foránea en la tabla pivote HomeWarehouse
        otherKey: 'person_id', // La otra clave foránea en la tabla pivote HomeWarehouse
        as: 'people'          // Alias para acceder a los almacenes asociados al hogar
    });

    Business.hasMany(models.BusinessPerson, {
      foreignKey: "business_id",
      as: "businessPeople",
      onDelete: "CASCADE",
    });

    Business.hasMany(models.Warehouse, {
      foreignKey: "business_id",
      as: "warehouses",
      onDelete: "CASCADE",
    });

    Business.hasMany(models.Recipe, {
      foreignKey: 'business_id',
      as: 'recipes',
    });
    }
  }
  Business.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que 'id' es la clave primaria
        autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "El campo user_id es obligatorio",
          },
          isInt: {
            msg: "El campo user_id debe ser un número entero",
          },
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
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Business",
      tableName: "businesses",
      timestamps: true,
    }
  );
  return Business;
};
