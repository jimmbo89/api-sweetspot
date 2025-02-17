"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Person.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Person.belongsToMany(models.Business, {
        through: models.BusinessPerson,
        foreignKey: 'person_id',    // La clave foránea en la tabla pivote HomeWarehouse
        otherKey: 'business_id', // La otra clave foránea en la tabla pivote HomeWarehouse
        as: 'businesses'          // Alias para acceder a los almacenes asociados al hogar
    });
    Person.hasMany(models.BusinessPerson, {
      foreignKey: "person_id",
      as: "businessPeople",
      onDelete: "CASCADE",
    });
    }
  }
  Person.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que 'id' es la clave primaria
        autoIncrement: true, // Esto hace que el campo 'id' sea auto-incrementable
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,  // El correo debe ser único
        validate: {
          isEmail: {
            msg: 'Debe ser un correo electrónico válido'
          }
        },
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
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
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Person",
      tableName: "people",
      timestamps: true,
    }
  );
  return Person;
};
