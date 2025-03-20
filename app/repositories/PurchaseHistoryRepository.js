const { Op } = require("sequelize");
const { PurchaseHistory, Business, Person, Warehouse } = require("../models");
const logger = require("../../config/logger");

const PurchaseHistoryRepository = {
  // Obtener todos los registros de purchase_histories con relaciones
  async findAll() {
    return await PurchaseHistory.findAll({
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
    });
  },

  // Obtener registros por business_id con paginación basada en cursor
  async findAllByBusiness(businessId, cursor, pageSize = 10) {
    const options = {
      where: { business_id: businessId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
      limit: pageSize,
      order: [["id", "ASC"]], // Ordenamos por id para la paginación basada en cursor
    };

    if (cursor) {
      options.where.id = { [Op.gt]: cursor }; // Usamos el cursor para obtener los siguientes registros
    }

    const result = await PurchaseHistory.findAndCountAll(options);

    const purchaseHistories = result.rows;
    const nextCursor =
      purchaseHistories.length > 0
        ? purchaseHistories[purchaseHistories.length - 1].id
        : null;

    return {
      purchaseHistories,
      nextCursor,
    };
  },

  // Buscar un registro por ID con relaciones
  async findById(id) {
    return await PurchaseHistory.findByPk(id, {
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
    });
  },

  // Crear un nuevo registro en purchase_histories
  async create(body, t) {
    const {
      business_id,
      person_id,
      warehouse_id,
      price,
      expirationDate,
      quantity,
      description,
      unitType,
    } = body;

    try {
      const purchaseHistory = await PurchaseHistory.create(
        {
          business_id,
          person_id,
          warehouse_id,
          price,
          expirationDate,
          quantity,
          description,
          unitType,
        },
        { transaction: t }
      );

      logger.info(
        `Registro de purchase_history creado exitosamente (ID: ${purchaseHistory.id})`
      );

      // Actualizar el total del warehouse
      await WarehouseRepository.updateWarehouseTotal(
        warehouse_id,
        quantity,
        unitType,
        warehouse.measure,
        t
      );
      return purchaseHistory;
    } catch (error) {
      logger.error(`Error creando registro de purchase_history: ${error.message}`);
      throw error;
    }
  },

  // Actualizar un registro existente en purchase_histories
  async update(purchaseHistory, body, t) {
    const fieldsToUpdate = [
      "business_id",
      "person_id",
      "warehouse_id",
      "price",
      "expirationDate",
      "quantity",
      "description",
      "unitType",
    ];

    try {
      const updatedData = Object.keys(body)
        .filter(
          (key) => fieldsToUpdate.includes(key) && body[key] !== undefined
        )
        .reduce((obj, key) => {
          obj[key] = body[key];
          return obj;
        }, {});

      // Actualizar el registro solo si hay datos para cambiar
      if (Object.keys(updatedData).length > 0) {
        await purchaseHistory.update(updatedData, {
          transaction: t,
        });
        logger.info(
          `Registro de purchase_history actualizado exitosamente (ID: ${purchaseHistory.id})`
        );
      }

      return purchaseHistory;
    } catch (error) {
      logger.error(
        `Error actualizando registro de purchase_history con ID: ${purchaseHistory.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Eliminar un registro de purchase_histories
  async delete(purchaseHistory) {
    try {
      await purchaseHistory.destroy();
      logger.info(
        `Registro de purchase_history eliminado exitosamente (ID: ${purchaseHistory.id})`
      );
      return true;
    } catch (error) {
      logger.error(
        `Error eliminando registro de purchase_history con ID: ${purchaseHistory.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Métodos adicionales útiles
  async findByPerson(personId, options = {}) {
    return await PurchaseHistory.findAll({
      where: { person_id: personId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
      ...options,
    });
  },

  async findByWarehouse(warehouseId, options = {}) {
    return await PurchaseHistory.findAll({
      where: { warehouse_id: warehouseId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
      ...options,
    });
  },
};

module.exports = PurchaseHistoryRepository;