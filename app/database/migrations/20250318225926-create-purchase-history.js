'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("purchase_histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      unitType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      person_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'people',
          key: 'id'
        }
      },
      business_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'businesses',
          key: 'id'
        }
      },
      warehouse_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'warehouses',
          key: 'id'
        }
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
    await queryInterface.dropTable('purchase_histories');
  }
};