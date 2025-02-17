const { Op } = require("sequelize");
const { Warehouse, Product, Business } = require("../models");
const logger = require("../../config/logger");
const ImageService = require("../services/ImageService");

const WarehouseRepository = {
  // Obtener todos los registros de almacén con relaciones
  async findAll() {
    return await Warehouse.findAll({
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
      ],
    });
  },

  /*async findAllByBusiness(businessId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    return await Warehouse.findAndCountAll({
      where: { business_id: businessId },
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
      ],
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
  },*/

  async findAllByBusiness(businessId, cursor, pageSize = 10) {
    const options = {
      where: { business_id: businessId },
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
      ],
      limit: pageSize,
      order: [["id", "ASC"]], // Ordenamos por id para la paginación basada en cursor
    };

    if (cursor) {
      options.where.id = { [Op.gt]: cursor }; // Usamos el cursor para obtener los siguientes registros
    }

    const result = await Warehouse.findAndCountAll(options);

    const warehouses = result.rows;
    const nextCursor =
      warehouses.length > 0 ? warehouses[warehouses.length - 1].id : null;

    return {
      warehouses,
      nextCursor,
    };
  },
  // Buscar registro por ID con relaciones
  async findById(id) {
    return await Warehouse.findByPk(id, {
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
      ],
    });
  },

  // Crear nuevo registro con validación de relaciones
  async create(body, file, t) {
    const {
      product_id,
      business_id,
      expirationDate,
      description,
      measure,
      total,
    } = body;

    try {
      const warehouse = await Warehouse.create(
        {
          product_id: product_id,
          business_id: business_id,
          expirationDate: expirationDate,
          description: description,
          measure: measure,
          total: total, // Estado por defecto 0 para nuevos almacenes no asociados
        },
        { transaction: t }
      );
      if (file) {
        const newFilename = ImageService.generateFilename(
          "warehouses",
          warehouse.id,
          file.originalname
        );
        warehouse.image = await ImageService.moveFile(file, newFilename);
        await warehouse.update({ image: warehouse.image }, { transaction: t });
      }
      logger.info(
        `Registro de producto en el almacén creado ID: ${warehouse.id}`
      );
      return warehouse;
    } catch (error) {
      logger.error(`Error creando warehouse: ${error.message}`);
      throw error;
    }
  },

  // Actualizar registro con campos permitidos
  async update(warehouse, body, file, t) {
    const fieldsToUpdate = [
      "product_id",
      "business_id",
      "expirationDate",
      "description",
      "measure",
      "total",
      "image",
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

      if (file) {
        // Eliminar la imagen anterior si no es la predeterminada
        if (warehouse.image && warehouse.image !== "warehouses/default.jpg") {
          await ImageService.deleteFile(warehouse.image);
        }

        const newFilename = ImageService.generateFilename(
          "warehouses",
          warehouse.id,
          file.originalname
        );
        updatedData.image = await ImageService.moveFile(file, newFilename);
      }
      // Actualizar la tarea solo si hay datos para cambiar
      if (Object.keys(updatedData).length > 0) {
        await warehouse.update(updatedData, {
          transaction: t,
        });
        logger.info(`Producto actualizado exitosamente (ID: ${warehouse.id})`);
      }
      return warehouse;
    } catch (error) {
      logger.error(
        `Error actualizando producto en almacén con  ID en repository: ${warehouse.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Eliminar registro
  async delete(warehouse) {
    try {
      if (
        warehouse.image &&
        prwarehouseoduct.image !== "warehouses/default.jpg"
      ) {
        await ImageService.deleteFile(warehouse.image);
      }

      await warehouse.destroy();
      logger.info(`Warehouse eliminado ID: ${warehouse.id}`);
      return true;
    } catch (error) {
      logger.error(
        `Error eliminando warehouse ID: ${warehouse.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Métodos adicionales útiles
  async findByProduct(productId, options = {}) {
    return this.findAll({
      where: { productId },
      ...options,
    });
  },

  async getInventorySummary(businessId) {
    return await Warehouse.findAll({
      where: { businessId },
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("total")), "totalStock"],
        [
          sequelize.fn("MIN", sequelize.col("expirationDate")),
          "earliestExpiration",
        ],
      ],
      group: ["productId"],
      include: [{ model: Product, as: "product", attributes: ["name"] }],
    });
  },
};

module.exports = WarehouseRepository;
