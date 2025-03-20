const logger = require("../../config/logger");
const { PurchaseHistory, Business, Person, Warehouse, sequelize } = require("../models");
const {
  PurchaseHistoryRepository,
  BusinessRepository,
  PersonRepository,
  WarehouseRepository,
} = require("../repositories");

const PurchaseHistoryController = {
  // Listar todos los registros de purchase_histories
  async index(req, res) {
    logger.info(`${req.user.name} - Consultando todos los registros de purchase_histories`);

    try {
      const purchaseHistories = await PurchaseHistoryRepository.findAll();

      const response = purchaseHistories.map((purchaseHistory) => ({
        id: purchaseHistory.id,
        business_id: purchaseHistory.business_id,
        person_id: purchaseHistory.person_id,
        warehouse_id: purchaseHistory.warehouse_id,
        price: purchaseHistory.price,
        expirationDate: purchaseHistory.expirationDate,
        quantity: purchaseHistory.quantity,
        date: purchaseHistory.date,
        description: purchaseHistory.description,
        unitType: purchaseHistory.unitType,
      }));

      res.status(200).json({ purchaseHistories: response });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`PurchaseHistoryController->index: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Listar registros por business_id con paginación basada en cursor
  async businessPurchaseHistories(req, res) {
    const { business_id } = req.body;
    const cursor = req.body.cursor; // Nuevo campo para el cursor
    const pageSize = parseInt(req.body.pageSize) || 10;

    logger.info(
      `${req.user.name} - Consultando registros de purchase_histories para negocio: ${business_id} - Cursor: ${cursor}`
    );

    try {
      const { purchaseHistories, nextCursor } = await PurchaseHistoryRepository.findAllByBusiness(
        business_id,
        cursor,
        pageSize
      );

      const response = purchaseHistories.map((purchaseHistory) => ({
        id: purchaseHistory.id,
        business_id: purchaseHistory.business_id,
        person_id: purchaseHistory.person_id,
        warehouse_id: purchaseHistory.warehouse_id,
        price: purchaseHistory.price,
        expirationDate: purchaseHistory.expirationDate,
        quantity: purchaseHistory.quantity,
        date: purchaseHistory.date,
        description: purchaseHistory.description,
        unitType: purchaseHistory.unitType,
      }));

      res.status(200).json({
        purchaseHistories: response,
        pagination: {
          nextCursor: nextCursor,
          pageSize: pageSize,
        },
      });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`PurchaseHistoryController->businessPurchaseHistories: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Crear un nuevo registro en purchase_histories
  async store(req, res) {
    logger.info(`${req.user.name} - Creando nuevo registro en purchase_histories`);
    logger.info("Datos recibidos al crear un registro");
    logger.info(JSON.stringify(req.body));

    try {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `PurchaseHistoryController->store: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }

      const warehouse = await WarehouseRepository.findById(req.body.warehouse_id);
      if (!warehouse) {
        logger.info(
          `PurchaseHistoryController->store: Almacén no encontrado con ID ${req.body.warehouse_id}`
        );
        return res.status(400).json({ msg: "WarehouseNotFound" });
      }

      req.body.person_id = req.person.id;

      // Crear registro
      const t = await sequelize.transaction();
      try {
        const purchaseHistory = await PurchaseHistoryRepository.create(req.body, t);

        await WarehouseRepository.updateWarehouseTotal(
            warehouse,
            quantity,
            unitType,
            warehouse.measure,
            t
          );

        await t.commit();

        logger.info(`Registro de purchase_history creado exitosamente (ID: ${purchaseHistory.id})`);
        res.status(201).json(purchaseHistory);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("PurchaseHistoryController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Mostrar detalle de un registro en purchase_histories
  async show(req, res) {
    logger.info(`${req.user.name} - Consultando registro ID: ${req.params.id}`);

    try {
      const purchaseHistory = await PurchaseHistoryRepository.findById(req.body.id);

      if (!purchaseHistory) {
        return res.status(400).json({ error: "Registro no encontrado" });
      }

      const response = {
        id: purchaseHistory.id,
        business_id: purchaseHistory.business_id,
        person_id: purchaseHistory.person_id,
        warehouse_id: purchaseHistory.warehouse_id,
        price: purchaseHistory.price,
        expirationDate: purchaseHistory.expirationDate,
        quantity: purchaseHistory.quantity,
        date: purchaseHistory.date,
        description: purchaseHistory.description,
        unitType: purchaseHistory.unitType,
      };

      res.status(200).json({ purchaseHistory: response });
    } catch (error) {
      logger.error(`PurchaseHistoryController->show: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },

  // Actualizar un registro en purchase_histories
  async update(req, res) {
    logger.info(`${req.user.name} - Actualizando registro ID: ${req.body.id}`);
    logger.info("Datos recibidos al editar un registro");
    logger.info(JSON.stringify(req.body));

    const purchaseHistory = await PurchaseHistoryRepository.findById(req.body.id);

    if (!purchaseHistory) {
      return res.status(400).json({ error: "Registro no encontrado" });
    }

    if (req.body.business_id) {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `PurchaseHistoryController->update: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    if (req.body.warehouse_id) {
      const warehouse = await WarehouseRepository.findById(req.body.warehouse_id);
      if (!warehouse) {
        logger.info(
          `PurchaseHistoryController->update: Almacén no encontrado con ID ${req.body.warehouse_id}`
        );
        return res.status(400).json({ msg: "WarehouseNotFound" });
      }
    }

    try {
      const t = await sequelize.transaction();
      try {
        const updatedPurchaseHistory = await PurchaseHistoryRepository.update(
          purchaseHistory,
          req.body,
          t
        );
        await t.commit();

        res.status(200).json(updatedPurchaseHistory);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      logger.error(`PurchaseHistoryController->update: ${error.message}`);
      res.status(error.message.includes("no encontrada") ? 404 : 400).json({
        error:
          error.name === "ValidationError" ? "ValidationError" : "ServerError",
        details: error.message,
      });
    }
  },

  // Eliminar un registro en purchase_histories
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando registro ID: ${req.body.id}`);

    try {
      const purchaseHistory = await PurchaseHistoryRepository.findById(req.body.id);
      if (!purchaseHistory) {
        return res.status(400).json({ error: "Registro no encontrado" });
      }

      await PurchaseHistoryRepository.delete(purchaseHistory);
      res.status(200).json({ msg: "PurchaseHistoryDeleted" });
    } catch (error) {
      logger.error(`PurchaseHistoryController->destroy: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },
};

module.exports = PurchaseHistoryController;