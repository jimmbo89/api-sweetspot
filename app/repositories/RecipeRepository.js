const { Op } = require("sequelize");
const { Recipe, Business, Person } = require("../models");
const logger = require("../../config/logger");
const ImageService = require("../services/ImageService");

const RecipeRepository = {
    // Obtener todas las recetas con relaciones
    async findAll() {
      return await Recipe.findAll({
        include: [
          { model: Business, as: "business", attributes: ["id", "name"] },
          { model: Person, as: "person", attributes: ["id", "name"] },
        ],
      });
    },
  
    // Obtener recetas por business_id con paginación basada en cursor
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
  
      const result = await Recipe.findAndCountAll(options);
  
      const recipes = result.rows;
      const nextCursor =
        recipes.length > 0 ? recipes[recipes.length - 1].id : null;
  
      return {
        recipes,
        nextCursor,
      };
    },
  
    // Buscar receta por ID con relaciones
    async findById(id) {
      return await Recipe.findByPk(id, {
        include: [
          { model: Business, as: "business", attributes: ["id", "name"] },
          { model: Person, as: "person", attributes: ["id", "name"] },
        ],
      });
    },

    async existsByName(name, excludeId = null) {
        const whereCondition = excludeId
          ? { name, id: { [Op.ne]: excludeId } } // Excluir un ID específico
          : { name }; // Buscar solo por nombre
        return await Recipe.findOne({ where: whereCondition });
      },
  
    // Crear una nueva receta
    async create(body, file, t) {
      const { name, description, business_id, person_id } = body;
  
      try {
        const recipe = await Recipe.create(
          {
            name,
            description,
            business_id,
            person_id,
          },
          { transaction: t }
        );
  
        if (file) {
          const newFilename = ImageService.generateFilename(
            "recipes",
            recipe.id,
            file.originalname
          );
          recipe.image = await ImageService.moveFile(file, newFilename);
          await recipe.update({ image: recipe.image }, { transaction: t });
        }
  
        logger.info(`Receta creada exitosamente (ID: ${recipe.id})`);
        return recipe;
      } catch (error) {
        logger.error(`Error creando receta: ${error.message}`);
        throw error;
      }
    },
  
    // Actualizar una receta existente
    async update(recipe, body, file, t) {
      const fieldsToUpdate = ["name", "description", "business_id", "person_id", "image"];
  
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
          if (recipe.image && recipe.image !== "recipes/default.jpg") {
            await ImageService.deleteFile(recipe.image);
          }
  
          const newFilename = ImageService.generateFilename(
            "recipes",
            recipe.id,
            file.originalname
          );
          updatedData.image = await ImageService.moveFile(file, newFilename);
        }
  
        // Actualizar la receta solo si hay datos para cambiar
        if (Object.keys(updatedData).length > 0) {
          await recipe.update(updatedData, {
            transaction: t,
          });
          logger.info(`Receta actualizada exitosamente (ID: ${recipe.id})`);
        }
  
        return recipe;
      } catch (error) {
        logger.error(
          `Error actualizando receta con ID: ${recipe.id} - ${error.message}`
        );
        throw error;
      }
    },
  
    // Eliminar una receta
    async delete(recipe) {
      try {
        if (recipe.image && recipe.image !== "recipes/default.jpg") {
          await ImageService.deleteFile(recipe.image);
        }
  
        await recipe.destroy();
        logger.info(`Receta eliminada exitosamente (ID: ${recipe.id})`);
        return true;
      } catch (error) {
        logger.error(
          `Error eliminando receta con ID: ${recipe.id} - ${error.message}`
        );
        throw error;
      }
    },
  
    // Métodos adicionales útiles
    async findByPerson(personId, options = {}) {
      return await Recipe.findAll({
        where: { person_id: personId },
        include: [
          { model: Business, as: "business", attributes: ["id", "name"] },
          { model: Person, as: "person", attributes: ["id", "name"] },
        ],
        ...options,
      });
    },
  };
  
  module.exports = RecipeRepository;