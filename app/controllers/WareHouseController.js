const { Op } = require("sequelize");
const Joi = require("joi");
const logger = require("../../config/logger");
const { Warehouse, Product, Business, sequelize } = require("../models");
const {
  WarehouseRepository,
  ProductRepository,
  BusinessRepository,
} = require("../repositories");

const WarehouseController = {
  // Listar todos los registros de almacén
  async index(req, res) {
    logger.info(
      `${req.user.name} - Consultando todos los registros de almacén`
    );

    try {
      const warehouses = await WarehouseRepository.findAll();

      const response = warehouses.map((warehouse) => ({
        id: warehouse.id,
        product_id: warehouse.product_id,
        productId: warehouse.product_id,
        productId: warehouse.product_id,
        name: warehouse.product.name,
        expirationDate: warehouse.expirationDate,
        description: warehouse.description,
        measure: warehouse.measure,
        total: warehouse.total,
        image: warehouse.image,
      }));

      res.status(200).json({ warehouses: response });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`WarehouseController->index: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /*async businessWarehouses(req, res) {
    const { business_id } = req.body;
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;
  
    logger.info(
      `${req.user.name} - Consultando registros de almacén para negocio: ${business_id} - Página: ${page}`
    );
  
    try {
      const { count, rows: warehouses } = await WarehouseRepository.findAllByBusiness(
        business_id,
        page,
        pageSize
      );
  
      const response = warehouses.map((warehouse) => ({
        id: warehouse.id,
        product_id: warehouse.product_id,
        productId: warehouse.product_id,
        name: warehouse.product.name,
        expirationDate: warehouse.expirationDate,
        description: warehouse.description,
        measure: warehouse.measure,
        total: warehouse.total,
        image: warehouse.image,
      }));
  
      res.status(200).json({
        warehouse: response,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          pageSize: pageSize
        }
      });
    } catch (error) {
      const errorMsg = error.details?.map((detail) => detail.message).join(", ") || error.message;
      logger.error(`WarehouseController->businessWarehouses: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },*/

  async businessWarehouses(req, res) {
    const { business_id } = req.body;
    const cursor = req.body.cursor; // Nuevo campo para el cursor
    const pageSize = parseInt(req.body.pageSize) || 10;

    logger.info(
      `${req.user.name} - Consultando registros de almacén para negocio: ${business_id} - Cursor: ${cursor}`
    );

    try {
      const { warehouses, nextCursor } =
        await WarehouseRepository.findAllByBusiness(
          business_id,
          cursor,
          pageSize
        );

      const response = warehouses.map((warehouse) => ({
        id: warehouse.id,
        product_id: warehouse.product_id,
        productId: warehouse.product_id,
        name: warehouse.product.name,
        expirationDate: warehouse.expirationDate,
        description: warehouse.description,
        measure: warehouse.measure,
        total: warehouse.total,
        image: warehouse.image,
      }));

      res.status(200).json({
        warehouse: response,
        pagination: {
          nextCursor: nextCursor,
          pageSize: pageSize,
        },
      });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`WarehouseController->businessWarehouses: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
  // Crear nuevo registro en almacén
  async store(req, res) {
    logger.info(`${req.user.name} - Creando nuevo registro en almacén`);
    logger.info("datos recibidos al crear un producto");
    logger.info(JSON.stringify(req.body));

    try {
      let product;
      if (req.body.product_id && req.body.product_id !== undefined) {
        product = await ProductRepository.findByPk(req.body.product_id);
        if (!product) {
          logger.info(
            `WarehouseController->store: Producto no encontrado con ID ${req.body.product_id}`
          );
          return res.status(400).json({ msg: "ProductNotFound" });
        }
      }

      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `WarehouseController->store: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }

      // Crear registro
      const t = await sequelize.transaction();
      try {
        // Si no existe el producto, crear uno nuevo
        if (!product) {
          logger.info("WarehouseController->store: Creando nuevo producto");
          const productName = await ProductRepository.existsByName(
            req.body.name
          );
          if (productName) {
            logger.info(
              `WarehouseController->store: Ya existe un Producto con ese nombre ID ${req.body.name}`
            );
            await t.commit();
            return res.status(400).json({ msg: "ProductExist" });
          }
          product = await ProductRepository.create(req.body, t);

          req.body.product_id = product.id;
        }
        const warehouse = await WarehouseRepository.create(
          req.body,
          req.file,
          t
        );
        await t.commit();

        logger.info(`Registro de almacén creado ID: ${warehouse.id}`);
        res.status(201).json(warehouse);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("WarehouseController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Mostrar detalle de registro
  async show(req, res) {
    logger.info(
      `${req.user.name} - Consultando registro de almacén ID: ${req.params.id}`
    );

    try {
      const warehouse = await WarehouseRepository.findById(req.body.id);

      if (!warehouse) {
        return res.status(400).json({ error: "Registro no encontrado" });
      }

      const response = {
        id: warehouse.id,
        productId: warehouse.product_id,
        product_id: warehouse.product_id,
        nameProduct: warehouse.product.name,
        expirationDate: warehouse.expirationDate,
        description: warehouse.description,
        measure: warehouse.measure,
        total: warehouse.total,
        image: warehouse.image,
      };

      res.status(200).json({ warehouse: response });
    } catch (error) {
      logger.error(`WarehouseController->show: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },

  // Actualizar registro
  async update(req, res) {
    logger.info(`${req.user.name} - Actualizando registro ID: ${req.body.id}`);
    logger.info("datos recibidos al editar un producto");
    logger.info(JSON.stringify(req.body));

    const warehouse = await WarehouseRepository.findById(req.body.id);

    if (!warehouse) {
      return res.status(400).json({ error: "Registro no encontrado" });
    }

    if (req.body.business_id) {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `WarehouseController->update: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    let product;
    if (req.body.product_id) {
      product = await ProductRepository.findById(req.body.product_id);
      if (!product) {
        logger.info(
          `WarehouseController->update: Producto no encontrado con ID ${req.body.product_id}`
        );
        return res.status(204).json({ msg: "ProductNotFound" });
      }
    } else {
      product = await ProductRepository.findById(warehouse.product_id);
    }

    try {
      const t = await sequelize.transaction();
      try {
        if (req.body.name) {
          logger.info("WarehouseController->update: Editando el producto");
          const productName = await ProductRepository.existsByName(
            req.body.name,
            product.id
          );
          if (productName) {
            logger.info(
              `WarehouseController->update: Ya existe un Producto con ese name ${req.body.name}`
            );
            await t.commit();
            return res.status(400).json({ msg: "ProductExist" });
          }
          const productUodate = await ProductRepository.update(
            product,
            req.body,
            t
          );
        }

        const updatedWarehouse = await WarehouseRepository.update(
          warehouse,
          req.body,
          req.file,
          t
        );
        await t.commit();

        res.status(200).json(updatedWarehouse);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      logger.error(`WarehouseController->update: ${error.message}`);
      res.status(error.message.includes("no encontrado") ? 404 : 400).json({
        error:
          error.name === "ValidationError" ? "ValidationError" : "ServerError",
        details: error.message,
      });
    }
  },

  // Eliminar registro
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando registro ID: ${req.body.id}`);

    try {
      const warehouse = await WarehouseRepository.findById(req.body.id);
      if (!warehouse) {
        return res.status(400).json({ error: "Registro no encontrado" });
      }

      await WarehouseRepository.delete(warehouse);
      res.status(200).json({ msg: "ProductDeleted" });
    } catch (error) {
      logger.error(`WarehouseController->destroy: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },
};

module.exports = WarehouseController;
