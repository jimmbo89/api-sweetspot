const logger = require("../../config/logger");
const {
  ProductRepository,
  RecipeRepository,
  BusinessRepository,
  ProductRecipeRepository,
} = require("../repositories");

const ProductRecipeController = {
  /**
   * Obtener todas las relaciones Product-Recipe.
   */
  async index(req, res) {
    logger.info(`${req.user.name} - Busca todas las relaciones Product-Recipe`);
    try {
      const productRecipes = await ProductRecipeController.index();

      // Mapear los resultados para obtener solo los datos necesarios
      const mappedProductRecipes = productRecipes.map((productRecipe) => ({
        id: productRecipe.id,
        recipe_id: productRecipe.recipe_id,
        recipeId: productRecipe.recipe_id,
        recipeName: productRecipe.recipe.name,
        product_id: productRecipe.product_id,
        productId: productRecipe.product_id,
        productName: productRecipe.product.name,
        cant: productRecipe.cant,
      }));

      res.status(200).json({ productRecipes: mappedProductRecipes });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->index: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Obtener todas las relaciones Product-Recipe para una receta específica.
   */
  async indexByRecipe(req, res) {
    const { recipe_id } = req.body;
    logger.info(
      `${req.user.name} - Busca todas las relaciones Product-Recipe para la receta ${recipe_id}`
    );

    try {
      const recipe = await RecipeRepository.findById(recipe_id);
      if (!recipe) {
        logger.error(
          `ProductRecipeController->indexByRecipe: Receta no encontrada con ID ${recipe_id}`
        );
        return res.status(404).json({ msg: "RecipeNotFound" });
      }

      // Obtener los productos asociados a la receta desde el repositorio
      const productRecipes = await ProductRecipeRepository.getProductsByRecipeId(recipe_id);

      const mappedProductRecipes = productRecipes.map((productRecipe) => ({
        id: productRecipe.id,
        recipe_id: productRecipe.recipe_id,
        recipeId: productRecipe.recipe_id,
        recipeName: productRecipe.recipe.name,
        product_id: productRecipe.product_id,
        productId: productRecipe.product_id,
        productName: productRecipe.product.name,
        cant: productRecipe.cant,
      }));

      res.status(200).json({ productRecipes: mappedProductRecipes });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->indexByRecipe: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Crear una nueva relación Product-Recipe.
   */
  async store(req, res) {
    logger.info(`${req.user.name} - Crea una nueva relación Product-Recipe`);
    logger.info("Datos recibidos al asociar un producto a una receta:");
    logger.info(JSON.stringify(req.body));

    const { recipe_id, product_id, business_id,  cant } = req.body;
    const person_id = req.person.id;

    const recipe = await RecipeRepository.findById(recipe_id);
    if (!recipe) {
      logger.error(
        `ProductRecipeController->store: Receta no encontrada con ID ${recipe_id}`
      );
      return res.status(404).json({ msg: "RecipeNotFound" });
    }

    const product = await ProductRepository.findById(product_id);
    if (!product) {
      logger.error(
        `ProductRecipeController->store: Producto no encontrado con ID ${product_id}`
      );
      return res.status(404).json({ msg: "ProductNotFound" });
    }

    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(
        `ProductRecipeController->store: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(404).json({ msg: "BusinessNotFound" });
    }

    const t = await sequelize.transaction();
    try {
      const productRecipe = await ProductRecipe.create(
        {
          recipe_id,
          product_id,
          business_id,
          person_id,
          cant,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(201).json({ msg: "ProductRecipeCreated", productRecipe });
    } catch (error) {
      await t.rollback();
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->store: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Asociar un array de productos a una receta.
   */
  async assignProductsToRecipe(req, res) {
    logger.info(`${req.user.name} - Asocia productos a una receta`);
    const { recipe_id, business_id, products } = req.body;

    const person_id = req.person.id;

    const recipe = await RecipeRepository.findById(recipe_id);
    if (!recipe) {
      logger.error(
        `ProductRecipeController->assignProductsToRecipe: Receta no encontrada con ID ${recipe_id}`
      );
      return res.status(404).json({ msg: "RecipeNotFound" });
    }

    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(
        `ProductRecipeController->assignProductsToRecipe: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(404).json({ msg: "BusinessNotFound" });
    }

    // Extraer los IDs de los productos del array
    const productIds = products.map((product) => product.product_id);

    // Verificar si todos los productos existen
    const existingProducts = await ProductRepository.findByIds(productIds);
    const missingProductIds = productIds.filter(
        (id) => !existingProducts.find((product) => product.id === id)
    );

    // Si faltan productos, devolver un error
    if (missingProductIds.length > 0) {
        logger.error(
            `ProductRecipeController->assignProductsToRecipe: Los siguientes productos no existen: ${missingProductIds}`
        );
        return res.status(404).json({
            msg: "ProductNotFound",
            missingProductIds,
        });
    }

    const t = await sequelize.transaction();
    try {
      await ProductRecipeRepository.assignProductsToRecipe(
        recipe_id,
        business_id,
        person_id,
        products,
        t
      );

      await t.commit();
      res.status(201).json({ msg: "ProductsAssignedToRecipe" });
    } catch (error) {
      await t.rollback();
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->assignProductsToRecipe: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Actualizar la cantidad de un producto en una receta.
   */
  async updateProductQuantity(req, res) {
    logger.info(`${req.user.name} - Actualiza la cantidad de un producto en una receta`);
    const { id, cant } = req.body;

    try {
      const productRecipe = await ProductRecipeRepository.updateProductQuantity(id, cant);
      res.status(200).json({ msg: "ProductQuantityUpdated", productRecipe });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->updateProductQuantity: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  /**
   * Eliminar una relación Product-Recipe.
   */
  async destroy(req, res) {
    logger.info(`${req.user.name} - Elimina una relación Product-Recipe`);
    const { id } = req.body;

    try {
      const productRecipe = await ProductRecipeRepository.deleteProductRecipe(id);
      if (!productRecipe) {
        return res.status(404).json({ msg: "ProductRecipeNotFound" });
      }

      res.status(200).json({ msg: "ProductRecipeDeleted" });
    } catch (error) {
      const errorMsg = error.message || "Error desconocido";
      logger.error("ProductRecipeController->destroy: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
};

module.exports = ProductRecipeController;