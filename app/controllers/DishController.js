const logger = require("../../config/logger");
const { Dish, Business, Person, sequelize } = require("../models");
const {
  DishRepository,
  BusinessRepository,
  PersonRepository,
} = require("../repositories");

const DishController = {
  // Listar todos los platos
  async index(req, res) {
    logger.info(`${req.user.name} - Consultando todos los platos`);

    try {
      const dishes = await DishRepository.findAll();

      const response = dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        image: dish.image,
        price: dish.price,
        status: dish.status,
      }));

      res.status(200).json({ dishes: response });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`DishController->index: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Listar platos por business_id con paginación basada en cursor
  async businessDishes(req, res) {
    const { business_id } = req.body;
    const cursor = req.body.cursor; // Nuevo campo para el cursor
    const pageSize = parseInt(req.body.pageSize) || 10;

    logger.info(
      `${req.user.name} - Consultando platos para negocio: ${business_id} - Cursor: ${cursor}`
    );

    try {
      const { dishes, nextCursor } = await DishRepository.findAllByBusiness(
        business_id,
        cursor,
        pageSize
      );

      const response = dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        image: dish.image,
        price: dish.price,
        status: dish.status,
      }));

      res.status(200).json({
        dishes: response,
        pagination: {
          nextCursor: nextCursor,
          pageSize: pageSize,
        },
      });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`DishController->businessDishes: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Crear un nuevo plato
  async store(req, res) {
    logger.info(`${req.user.name} - Creando nuevo plato`);
    logger.info("Datos recibidos al crear un plato");
    logger.info(JSON.stringify(req.body));

    try {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `DishController->store: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }

      req.body.person_id = req.person.id;

      // Crear plato
      const t = await sequelize.transaction();
      try {
        const dishName = await DishRepository.existsByName(req.body.name);
        if (dishName) {
          logger.info(
            `DishController->store: Ya existe un plato con ese nombre ${req.body.name}`
          );
          await t.commit();
          return res.status(400).json({ msg: "DishExist" });
        }
        const dish = await DishRepository.create(req.body, req.file, t);
        await t.commit();

        logger.info(`Plato creado exitosamente (ID: ${dish.id})`);
        res.status(201).json(dish);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Mostrar detalle de un plato
  async show(req, res) {
    logger.info(`${req.user.name} - Consultando plato ID: ${req.params.id}`);

    try {
      const dish = await DishRepository.findById(req.body.id);

      if (!dish) {
        return res.status(400).json({ error: "Plato no encontrado" });
      }

      const response = {
        id: dish.id,
        name: dish.name,
        description: dish.description,
        image: dish.image,
        price: dish.price,
        status: dish.status,
      };

      res.status(200).json({ dish: response });
    } catch (error) {
      logger.error(`DishController->show: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },

  // Actualizar un plato
  async update(req, res) {
    logger.info(`${req.user.name} - Actualizando plato ID: ${req.body.id}`);
    logger.info("Datos recibidos al editar un plato");
    logger.info(JSON.stringify(req.body));

    const dish = await DishRepository.findById(req.body.id);

    if (!dish) {
      return res.status(400).json({ error: "Plato no encontrado" });
    }

    if (req.body.business_id) {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `DishController->update: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    try {
      const t = await sequelize.transaction();
      try {
        if (req.body.name) {
          const dishName = await DishRepository.existsByName(
            req.body.name,
            dish.id
          );
          if (dishName) {
            logger.info(
              `DishController->update: Ya existe un plato con ese nombre ${req.body.name}`
            );
            await t.commit();
            return res.status(400).json({ msg: "DishExist" });
          }
        }
        const updatedDish = await DishRepository.update(
          dish,
          req.body,
          req.file,
          t
        );
        await t.commit();

        res.status(200).json(updatedDish);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      logger.error(`DishController->update: ${error.message}`);
      res.status(error.message.includes("no encontrada") ? 404 : 400).json({
        error:
          error.name === "ValidationError" ? "ValidationError" : "ServerError",
        details: error.message,
      });
    }
  },

  // Eliminar un plato
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando plato ID: ${req.body.id}`);

    try {
      const dish = await DishRepository.findById(req.body.id);
      if (!dish) {
        return res.status(400).json({ error: "Plato no encontrado" });
      }

      await DishRepository.delete(dish);
      res.status(200).json({ msg: "DishDeleted" });
    } catch (error) {
      logger.error(`DishController->destroy: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },
};

module.exports = DishController;