const logger = require("../../config/logger");
const { Recipe, Business, Person, sequelize } = require("../models");
const {
  RecipeRepository,
  BusinessRepository,
  PersonRepository,
} = require("../repositories");

const RecipeController = {
  // Listar todas las recetas
  async index(req, res) {
    logger.info(`${req.user.name} - Consultando todas las recetas`);

    try {
      const recipes = await RecipeRepository.findAll();

      const response = recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        business_id: recipe.business_id,
        business_name: recipe.business.name,
        person_id: recipe.person_id,
        person_name: recipe.person.name,
      }));

      res.status(200).json({ recipes: response });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`RecipeController->index: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Listar recetas por business_id con paginación basada en cursor
  async businessRecipes(req, res) {
    const { business_id } = req.body;
    const cursor = req.body.cursor; // Nuevo campo para el cursor
    const pageSize = parseInt(req.body.pageSize) || 10;

    logger.info(
      `${req.user.name} - Consultando recetas para negocio: ${business_id} - Cursor: ${cursor}`
    );

    try {
      const { recipes, nextCursor } = await RecipeRepository.findAllByBusiness(
        business_id,
        cursor,
        pageSize
      );

      const response = recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        business_id: recipe.business_id,
        business_name: recipe.business.name,
        person_id: recipe.person_id,
        person_name: recipe.person.name,
      }));

      res.status(200).json({
        recipes: response,
        pagination: {
          nextCursor: nextCursor,
          pageSize: pageSize,
        },
      });
    } catch (error) {
      const errorMsg =
        error.details?.map((detail) => detail.message).join(", ") ||
        error.message;
      logger.error(`RecipeController->businessRecipes: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Crear una nueva receta
  async store(req, res) {
    logger.info(`${req.user.name} - Creando nueva receta`);
    logger.info("Datos recibidos al crear una receta");
    logger.info(JSON.stringify(req.body));

    try {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `RecipeController->store: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }

      req.body.person_id = req.person.id;

      // Crear receta
      const t = await sequelize.transaction();
      try {
        const productName = await RecipeRepository.existsByName(req.body.name);
        if (productName) {
          logger.info(
            `RecipeController->store: Ya existe una receta con ese nombre ${req.body.name}`
          );
          await t.commit();
          return res.status(400).json({ msg: "RecipeExist" });
        }
        const recipe = await RecipeRepository.create(req.body, req.file, t);
        await t.commit();

        logger.info(`Receta creada exitosamente (ID: ${recipe.id})`);
        res.status(201).json(recipe);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("RecipeController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Mostrar detalle de una receta
  async show(req, res) {
    logger.info(`${req.user.name} - Consultando receta ID: ${req.params.id}`);

    try {
      const recipe = await RecipeRepository.findById(req.body.id);

      if (!recipe) {
        return res.status(400).json({ error: "Receta no encontrada" });
      }

      const response = {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        business_id: recipe.business_id,
        business_name: recipe.business.name,
        person_id: recipe.person_id,
        person_name: recipe.person.name,
      };

      res.status(200).json({ recipe: response });
    } catch (error) {
      logger.error(`RecipeController->show: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },

  // Actualizar una receta
  async update(req, res) {
    logger.info(`${req.user.name} - Actualizando receta ID: ${req.body.id}`);
    logger.info("Datos recibidos al editar una receta");
    logger.info(JSON.stringify(req.body));

    const recipe = await RecipeRepository.findById(req.body.id);

    if (!recipe) {
      return res.status(400).json({ error: "Receta no encontrada" });
    }

    if (req.body.business_id) {
      const business = await BusinessRepository.findById(req.body.business_id);
      if (!business) {
        logger.info(
          `RecipeController->update: Negocio no encontrado con ID ${req.body.business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    if (req.body.person_id) {
      const person = await PersonRepository.findById(req.body.person_id);
      if (!person) {
        logger.info(
          `RecipeController->update: Persona no encontrada con ID ${req.body.person_id}`
        );
        return res.status(400).json({ msg: "PersonNotFound" });
      }
    }

    try {
      const t = await sequelize.transaction();
      try {
        if (req.body.name) {
            logger.info("RecipeController->update: Editando el producto");
            const productName = await RecipeRepository.existsByName(
              req.body.name,
              recipe.id
            );
            if (productName) {
              logger.info(
                `RecipeController->update: Ya existe una Receta con ese nombre ${req.body.name}`
              );
              await t.commit();
              return res.status(400).json({ msg: "RecipeExist" });
            }
        }
        const updatedRecipe = await RecipeRepository.update(
          recipe,
          req.body,
          req.file,
          t
        );
        await t.commit();

        res.status(200).json(updatedRecipe);
      } catch (tError) {
        await t.rollback();
        throw tError;
      }
    } catch (error) {
      logger.error(`RecipeController->update: ${error.message}`);
      res.status(error.message.includes("no encontrada") ? 404 : 400).json({
        error:
          error.name === "ValidationError" ? "ValidationError" : "ServerError",
        details: error.message,
      });
    }
  },

  // Eliminar una receta
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando receta ID: ${req.body.id}`);

    try {
      const recipe = await RecipeRepository.findById(req.body.id);
      if (!recipe) {
        return res.status(400).json({ error: "Receta no encontrada" });
      }

      await RecipeRepository.delete(recipe);
      res.status(200).json({ msg: "RecipeDeleted" });
    } catch (error) {
      logger.error(`RecipeController->destroy: ${error.message}`);
      res.status(500).json({ error: "ServerError", details: error.message });
    }
  },
};

module.exports = RecipeController;
