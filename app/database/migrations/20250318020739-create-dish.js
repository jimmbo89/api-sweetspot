'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dishes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      business_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'businesses', // Nombre de la tabla de businesses
          key: 'id'
        }
      },
      person_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'people', // Nombre de la tabla de people
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dishes');
  }
};