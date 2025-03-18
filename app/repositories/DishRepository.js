const { Op } = require("sequelize");
const { Dish, Business, Person } = require("../models");
const logger = require("../../config/logger");
const ImageService = require("../services/ImageService");

const DishRepository = {
  // Obtener todos los platos con relaciones
  async findAll() {
    return await Dish.findAll({
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
      ],
    });
  },

  // Obtener platos por business_id con paginación basada en cursor
  async findAllByBusiness(businessId, cursor, pageSize = 10) {
    const options = {
      where: { business_id: businessId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
      ],
      limit: pageSize,
      order: [["id", "ASC"]], // Ordenamos por id para la paginación basada en cursor
    };

    if (cursor) {
      options.where.id = { [Op.gt]: cursor }; // Usamos el cursor para obtener los siguientes registros
    }

    const result = await Dish.findAndCountAll(options);

    const dishes = result.rows;
    const nextCursor = dishes.length > 0 ? dishes[dishes.length - 1].id : null;

    return {
      dishes,
      nextCursor,
    };
  },

  // Buscar plato por ID con relaciones
  async findById(id) {
    return await Dish.findByPk(id, {
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
      ],
    });
  },

  // Verificar si un plato existe por nombre (útil para evitar duplicados)
  async existsByName(name, excludeId = null) {
    const whereCondition = excludeId
      ? { name, id: { [Op.ne]: excludeId } } // Excluir un ID específico
      : { name }; // Buscar solo por nombre
    return await Dish.findOne({ where: whereCondition });
  },

  // Crear un nuevo plato
  async create(body, file, t) {
    const { name, description, price, business_id, person_id } = body;

    try {
      const dish = await Dish.create(
        {
          name,
          description,
          price,
          business_id,
          person_id,
        },
        { transaction: t }
      );

      if (file) {
        const newFilename = ImageService.generateFilename(
          "dishes",
          dish.id,
          file.originalname
        );
        dish.image = await ImageService.moveFile(file, newFilename);
        await dish.update({ image: dish.image }, { transaction: t });
      }

      logger.info(`Plato creado exitosamente (ID: ${dish.id})`);
      return dish;
    } catch (error) {
      logger.error(`Error creando plato: ${error.message}`);
      throw error;
    }
  },

  // Actualizar un plato existente
  async update(dish, body, file, t) {
    const fieldsToUpdate = [
      "name",
      "description",
      "price",
      "business_id",
      "person_id",
      "image",
      "status",
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
        if (dish.image && dish.image !== "dishes/default.jpg") {
          await ImageService.deleteFile(dish.image);
        }

        const newFilename = ImageService.generateFilename(
          "dishes",
          dish.id,
          file.originalname
        );
        updatedData.image = await ImageService.moveFile(file, newFilename);
      }

      // Actualizar el plato solo si hay datos para cambiar
      if (Object.keys(updatedData).length > 0) {
        await dish.update(updatedData, {
          transaction: t,
        });
        logger.info(`Plato actualizado exitosamente (ID: ${dish.id})`);
      }

      return dish;
    } catch (error) {
      logger.error(
        `Error actualizando plato con ID: ${dish.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Eliminar un plato
  async delete(dish) {
    try {
      if (dish.image && dish.image !== "dishes/default.jpg") {
        await ImageService.deleteFile(dish.image);
      }

      await dish.destroy();
      logger.info(`Plato eliminado exitosamente (ID: ${dish.id})`);
      return true;
    } catch (error) {
      logger.error(
        `Error eliminando plato con ID: ${dish.id} - ${error.message}`
      );
      throw error;
    }
  },

  // Métodos adicionales útiles
  async findByPerson(personId, options = {}) {
    return await Dish.findAll({
      where: { person_id: personId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Person, as: "person", attributes: ["id", "name"] },
      ],
      ...options,
    });
  },
};

module.exports = DishRepository;