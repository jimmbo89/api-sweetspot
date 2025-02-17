"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("business_people", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      business_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "businesses", // Tabla relacionada
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      person_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "people", // Tabla relacionada
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "roles", // Tabla relacionada
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      active: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pix: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bank: {
        type: Sequelize.STRING,
        allowNull: true,
      },      
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      workplace: {  // Nuevo campo para controlar el tipo de lugar de trabajo
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,  // Asumimos que el valor por defecto es 1 (trabajo en el propio negocio)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("business_people");
  },
};
