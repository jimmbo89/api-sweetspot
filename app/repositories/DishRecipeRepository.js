const { Op } = require("sequelize");
const {
  Dish,
  Recipe,
  Business,
  Person,
  DishRecipe,
} = require("../models");
const logger = require("../../config/logger"); // Logger para seguimiento

const DishRecipeRepository = {
  /**
   * Asocia un array de recetas a un plato con sus respectivas cantidades y tipos.
   * @param {number} dish_id - ID del plato.
   * @param {number} business_id - ID del negocio.
   * @param {Array} recipes - Array de recetas con sus cantidades y tipos.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async assignRecipesToDish(
    dish_id,
    business_id,
    person_id,
    recipes,
    t = null
  ) {
    try {
      // Obtener todas las relaciones existentes para el plato, negocio y persona
      const existingDishRecipes = await DishRecipe.findAll({
        where: {
          dish_id,
          business_id,
          person_id,
        },
        transaction: t,
      });

      // Crear un mapa de las recetas existentes para facilitar la búsqueda
      const existingRecipeMap = new Map();
      existingDishRecipes.forEach((dishRecipe) => {
        existingRecipeMap.set(dishRecipe.recipe_id, dishRecipe);
      });

      // Crear un mapa de las recetas en el array para facilitar la búsqueda
      const newRecipeMap = new Map();
      recipes.forEach((recipe) => {
        newRecipeMap.set(recipe.recipe_id, recipe);
      });

      // Arrays para almacenar las operaciones a realizar
      const toCreate = [];
      const toUpdate = [];
      const toDelete = [];

      // 1. Verificar qué recetas crear, actualizar o eliminar
      for (const [recipeId, recipe] of newRecipeMap.entries()) {
        if (existingRecipeMap.has(recipeId)) {
          // Si la receta ya existe, actualizar la cantidad y el tipo
          const existingDishRecipe = existingRecipeMap.get(recipeId);
          if (
            existingDishRecipe.quantity !== recipe.quantity ||
            existingDishRecipe.type !== recipe.type
          ) {
            existingDishRecipe.quantity = recipe.quantity;
            existingDishRecipe.type = recipe.type;
            toUpdate.push(existingDishRecipe);
          }
        } else {
          // Si la receta no existe, crearla
          toCreate.push({
            dish_id,
            recipe_id: recipeId,
            business_id,
            person_id,
            quantity: recipe.quantity,
            type: recipe.type,
          });
        }
      }

      // 2. Verificar qué recetas eliminar (están en la base de datos pero no en el array)
      for (const [recipeId, dishRecipe] of existingRecipeMap.entries()) {
        if (!newRecipeMap.has(recipeId)) {
          toDelete.push(dishRecipe);
        }
      }

      // 3. Ejecutar las operaciones en la base de datos
      if (toCreate.length > 0) {
        await DishRecipe.bulkCreate(toCreate, { transaction: t });
      }

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((dishRecipe) =>
            dishRecipe.save({ transaction: t })
          )
        );
      }

      if (toDelete.length > 0) {
        await DishRecipe.destroy({
          where: {
            id: toDelete.map((dishRecipe) => dishRecipe.id),
          },
          transaction: t,
        });
      }

      logger.info("Recetas asociadas al plato exitosamente.");
    } catch (error) {
      logger.error("Error al asociar recetas al plato:", error);
      throw error;
    }
  },

  /**
   * Actualiza la cantidad y el tipo de una receta en un plato.
   * @param {number} id - ID de la relación en dish_recipes.
   * @param {number} quantity - Nueva cantidad.
   * @param {string} type - Nuevo tipo.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async updateRecipeDetails(id, quantity, type, t = null) {
    try {
      // Buscar la relación por ID
      const dishRecipe = await DishRecipe.findByPk(id, {
        transaction: t,
      });

      if (dishRecipe) {
        // Actualizar la cantidad y el tipo
        dishRecipe.quantity = quantity;
        dishRecipe.type = type;
        await dishRecipe.save({ transaction: t });
      }

      logger.info("Detalles de la receta actualizados exitosamente.");
      return dishRecipe;
    } catch (error) {
      logger.error("Error al actualizar los detalles de la receta:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las recetas asociadas a un plato.
   * @param {number} dish_id - ID del plato.
   * @returns {Array} - Array de recetas con sus cantidades y tipos.
   */
  async getRecipesByDishId(dish_id) {
    try {
      const dishRecipes = await DishRecipe.findAll({
        where: { dish_id },
        include: [
          { model: Recipe, as: "recipe" }, // Incluir el modelo Recipe
          { model: Business, as: "business" }, // Incluir el modelo Business
          { model: Person, as: "person" }, // Incluir el modelo Person
        ],
      });

      return dishRecipes;
    } catch (error) {
      logger.error("Error al obtener recetas por plato:", error);
      throw error;
    }
  },

  /**
   * Elimina una relación entre un plato y una receta.
   * @param {number} id - ID de la relación en dish_recipes.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async deleteDishRecipe(id, t = null) {
    try {
      const dishRecipe = await DishRecipe.findByPk(id, {
        transaction: t,
      });

      if (dishRecipe) {
        await dishRecipe.destroy({ transaction: t });
        logger.info("Relación plato-receta eliminada exitosamente.");
      }

      return dishRecipe;
    } catch (error) {
      logger.error("Error al eliminar la relación plato-receta:", error);
      throw error;
    }
  },

  /**
   * Actualiza múltiples relaciones plato-receta por sus IDs.
   * @param {Array} updatesArray - Array de objetos con id, quantity y type.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async updateDetailsById(updatesArray, t = null) {
    try {
      for (const update of updatesArray) {
        const { id, quantity, type } = update;

        // Buscar la relación por ID
        const dishRecipe = await DishRecipe.findByPk(id, {
          transaction: t,
        });

        if (dishRecipe) {
          // Actualizar la cantidad y el tipo
          dishRecipe.quantity = quantity;
          dishRecipe.type = type;
          await dishRecipe.save({ transaction: t });
        }
      }

      logger.info("Detalles actualizados exitosamente por id.");
    } catch (error) {
      logger.error("Error al actualizar detalles por id:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las relaciones plato-receta para un negocio y persona específicos.
   * @param {number} business_id - ID del negocio.
   * @param {number} person_id - ID de la persona.
   * @returns {Array} - Array de relaciones plato-receta.
   */
  async getDishRecipesByBusinessAndPerson(business_id, person_id = null) {
    try {
       // Construir la condición where
       const whereCondition = {
        business_id, // business_id siempre es requerido
        [Op.or]: [
          { person_id: person_id }, // Coincide con el person_id proporcionado
          { person_id: null }, // O person_id es null
        ],
      };

      // Realizar la consulta
      const dishRecipes = await DishRecipe.findAll({
        where: whereCondition, // Usar la condición construida
        include: [
          { model: Dish, as: "dish" }, // Incluir el modelo Dish
          { model: Recipe, as: "recipe" }, // Incluir el modelo Recipe
        ],
      });

      // Mapear los resultados para obtener solo los datos necesarios
      const mappedDishRecipes = dishRecipes.map((dishRecipe) => ({
        id: dishRecipe.id,
        dish_id: dishRecipe.dish_id,
        dishId: dishRecipe.dish_id,
        dishName: dishRecipe.dish.name, // Nombre del plato
        recipe_id: dishRecipe.recipe_id,
        recipeId: dishRecipe.recipe_id,
        recipeName: dishRecipe.recipe.name, // Nombre de la receta
        quantity: dishRecipe.quantity,
        type: dishRecipe.type,
      }));

      return mappedDishRecipes;
    } catch (error) {
      logger.error(
        "Error al obtener relaciones plato-receta por negocio y persona:",
        error
      );
      throw error;
    }
  },
};

module.exports = DishRecipeRepository;