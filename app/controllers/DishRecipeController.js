const logger = require("../../config/logger");
const {
  DishRepository,
  RecipeRepository,
  BusinessRepository,
  DishRecipeRepository,
} = require("../repositories");

const DishRecipeController = {
  /**
   * Obtener todas las relaciones Dish-Recipe.
   */
  async index(req, res) {
    logger.info(`${req.user.name} - Busca todas las relaciones Dish-Recipe`);
    try {
      const dishRecipes = await DishRecipeRepository.getDishRecipesByBusinessAndPerson(
        req.business.id,
        req.person?.id
      );

      // Mapear los resultados para obtener solo los datos necesarios
      const mappedDishRecipes = dishRecipes.map((dishRecipe) => ({
        id: dishRecipe.id,
        dish_id: dishRecipe.dish_id,
        dishId: dishRecipe.dish_id,
        dishName: dishRecipe.dish.name,
        recipe_id: dishRecipe.recipe_id,
        recipeId: dishRecipe.recipe_id,
        recipeName: dishRecipe.recipe.name,
        quantity: dishRecipe.quantity,
        type: dishRecipe.type,
      }));

      res.status(200).json({ dishRecipes: mappedDishRecipes });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->index: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Obtener todas las relaciones Dish-Recipe para una receta específica.
   */
  async indexByDish(req, res) {
    const { dish_id } = req.body; // Cambiar recipe_id por dish_id
    logger.info(
      `${req.user.name} - Busca todas las relaciones Dish-Recipe para el plato ${dish_id}`
    );
  
    try {
      // Verificar si el plato existe
      const dish = await DishRepository.findById(dish_id);
      if (!dish) {
        logger.error(
          `DishRecipeController->indexByDish: Plato no encontrado con ID ${dish_id}`
        );
        return res.status(404).json({ msg: "DishNotFound" });
      }
  
      // Obtener las recetas asociadas al plato desde el repositorio
      const dishRecipes = await DishRecipeRepository.getRecipesByDishId(dish_id);
  
      // Mapear los resultados para obtener solo los datos necesarios
      const mappedRecipes = dishRecipes.map((dishRecipe) => ({
        id: dishRecipe.id,
        dish_id: dishRecipe.dish_id,
        dishId: dishRecipe.dish_id,
        recipe_id: dishRecipe.recipe_id,
        recipeId: dishRecipe.recipe_id,
        recipeName: dishRecipe.recipe.name, // Nombre de la receta
        business_id: dishRecipe.business_id,
        businessId: dishRecipe.business_id,
        businessName: dishRecipe.business.name, // Nombre del negocio
        quantity: dishRecipe.quantity,
        type: dishRecipe.type,
      }));

      res.status(200).json({ dishRecipes: mappedRecipes });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->indexByDish: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Crear una nueva relación Dish-Recipe.
   */
  async store(req, res) {
    logger.info(`${req.user.name} - Crea una nueva relación Dish-Recipe`);
    logger.info("Datos recibidos al asociar un plato a una receta:");
    logger.info(JSON.stringify(req.body));

    const { recipe_id, dish_id, business_id, quantity, type } = req.body;
    const person_id = req.person?.id;

    const recipe = await RecipeRepository.findById(recipe_id);
    if (!recipe) {
      logger.error(
        `DishRecipeController->store: Receta no encontrada con ID ${recipe_id}`
      );
      return res.status(404).json({ msg: "RecipeNotFound" });
    }

    const dish = await DishRepository.findById(dish_id);
    if (!dish) {
      logger.error(
        `DishRecipeController->store: Plato no encontrado con ID ${dish_id}`
      );
      return res.status(404).json({ msg: "DishNotFound" });
    }

    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(
        `DishRecipeController->store: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(404).json({ msg: "BusinessNotFound" });
    }

    const t = await sequelize.transaction();
    try {
      const dishRecipe = await DishRecipeRepository.create(
        {
          recipe_id,
          dish_id,
          business_id,
          person_id,
          quantity,
          type,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(201).json({ msg: "DishRecipeCreated", dishRecipe });
    } catch (error) {
      await t.rollback();
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Asociar un array de recetas a un plato.
   */
  async assignRecipesToDish(req, res) {
    logger.info(`${req.user.name} - Asocia recetas a un plato`);
    const { dish_id, business_id, recipes } = req.body;

    const person_id = req.person?.id;

    const dish = await DishRepository.findById(dish_id);
    if (!dish) {
      logger.error(
        `DishRecipeController->assignRecipesToDish: Plato no encontrado con ID ${dish_id}`
      );
      return res.status(404).json({ msg: "DishNotFound" });
    }

    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(
        `DishRecipeController->assignRecipesToDish: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(404).json({ msg: "BusinessNotFound" });
    }

    // Extraer los IDs de las recetas del array
    const recipeIds = recipes.map((recipe) => recipe.recipe_id);

    // Verificar si todas las recetas existen
    const existingRecipes = await RecipeRepository.findByIds(recipeIds);
    const missingRecipeIds = recipeIds.filter(
        (id) => !existingRecipes.find((recipe) => recipe.id === id)
    );

    // Si faltan recetas, devolver un error
    if (missingRecipeIds.length > 0) {
        logger.error(
            `DishRecipeController->assignRecipesToDish: Las siguientes recetas no existen: ${missingRecipeIds}`
        );
        return res.status(404).json({
            msg: "RecipeNotFound",
            missingRecipeIds,
        });
    }

    const t = await sequelize.transaction();
    try {
      await DishRecipeRepository.assignRecipesToDish(
        dish_id,
        business_id,
        person_id,
        recipes,
        t
      );

      await t.commit();
      res.status(201).json({ msg: "RecipesAssignedToDish" });
    } catch (error) {
      await t.rollback();
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->assignRecipesToDish: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Actualizar la cantidad y el tipo de una receta en un plato.
   */
  async updateDishDetails(req, res) {
    logger.info(`${req.user.name} - Actualiza la cantidad y el tipo de una receta en un plato`);
    const { id, quantity, type } = req.body;

    try {
      const dishRecipe = await DishRecipeRepository.updateRecipeDetails(id, quantity, type);
      res.status(200).json({ msg: "RecipeDetailsUpdated", dishRecipe });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->updateRecipeDetails: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Eliminar una relación Dish-Recipe.
   */
  async destroy(req, res) {
    logger.info(`${req.user.name} - Elimina una relación Dish-Recipe`);
    const { id } = req.body;

    try {
      const dishRecipe = await DishRecipeRepository.deleteDishRecipe(id);
      if (!dishRecipe) {
        return res.status(404).json({ msg: "DishRecipeNotFound" });
      }

      res.status(200).json({ msg: "DishRecipeDeleted" });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("DishRecipeController->destroy: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
};

module.exports = DishRecipeController;