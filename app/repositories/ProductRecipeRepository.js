const { Op } = require("sequelize");
const {
  Product,
  Recipe,
  Business,
  Person,
  ProductRecipe,
} = require("../models");
const logger = require("../../config/logger"); // Logger para seguimiento

const ProductRecipeRepository = {
  /**
   * Asocia un array de productos a una receta con sus respectivas cantidades.
   * @param {number} recipe_id - ID de la receta.
   * @param {number} business_id - ID del negocio.
   * @param {number} person_id - ID de la persona.
   * @param {Array} products - Array de productos con sus cantidades.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async assignProductsToRecipe(
    recipe_id,
    business_id,
    person_id,
    products,
    t = null
  ) {
    try {
      // Obtener todas las relaciones existentes para la receta, negocio y persona
      const existingProductRecipes = await ProductRecipe.findAll({
        where: {
          recipe_id,
          business_id,
          person_id,
        },
        transaction: t,
      });

      // Crear un mapa de los productos existentes para facilitar la búsqueda
      const existingProductMap = new Map();
      existingProductRecipes.forEach((productRecipe) => {
        existingProductMap.set(productRecipe.product_id, productRecipe);
      });

      // Crear un mapa de los productos en el array para facilitar la búsqueda
      const newProductMap = new Map();
      products.forEach((product) => {
        newProductMap.set(product.product_id, product);
      });

      // Arrays para almacenar las operaciones a realizar
      const toCreate = [];
      const toUpdate = [];
      const toDelete = [];

      // 1. Verificar qué productos crear, actualizar o eliminar
      for (const [productId, product] of newProductMap.entries()) {
        if (existingProductMap.has(productId)) {
          // Si el producto ya existe, actualizar la cantidad
          const existingProductRecipe = existingProductMap.get(productId);
          if (existingProductRecipe.cant !== product.cant) {
            existingProductRecipe.cant = product.cant;
            toUpdate.push(existingProductRecipe);
          }
        } else {
          // Si el producto no existe, crearlo
          toCreate.push({
            recipe_id,
            product_id: productId,
            business_id,
            person_id,
            cant: product.cant,
          });
        }
      }

      // 2. Verificar qué productos eliminar (están en la base de datos pero no en el array)
      for (const [productId, productRecipe] of existingProductMap.entries()) {
        if (!newProductMap.has(productId)) {
          toDelete.push(productRecipe);
        }
      }

      // 3. Ejecutar las operaciones en la base de datos
      if (toCreate.length > 0) {
        await ProductRecipe.bulkCreate(toCreate, { transaction: t });
      }

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((productRecipe) =>
            productRecipe.save({ transaction: t })
          )
        );
      }

      if (toDelete.length > 0) {
        await ProductRecipe.destroy({
          where: {
            id: toDelete.map((productRecipe) => productRecipe.id),
          },
          transaction: t,
        });
      }

      logger.info("Productos asociados a la receta exitosamente.");
    } catch (error) {
      logger.error("Error al asociar productos a la receta:", error);
      throw error;
    }
  },

  /**
   * Actualiza la cantidad de un producto en una receta.
   * @param {number} id - ID de la relación en product_recipes.
   * @param {number} cant - Nueva cantidad.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async updateProductQuantity(id, cant, t = null) {
    try {
      // Buscar la relación por ID
      const productRecipe = await ProductRecipe.findByPk(id, {
        transaction: t,
      });

      if (productRecipe) {
        // Actualizar la cantidad
        productRecipe.cant = cant;
        await productRecipe.save({ transaction: t });
      }

      logger.info("Cantidad de producto actualizada exitosamente.");
      return productRecipe;
    } catch (error) {
      logger.error("Error al actualizar la cantidad del producto:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los productos asociados a una receta.
   * @param {number} recipe_id - ID de la receta.
   * @returns {Array} - Array de productos con sus cantidades.
   */
  async getProductsByRecipeId(recipe_id) {
    try {
      const productRecipes = await ProductRecipe.findAll({
        where: { recipe_id },
        include: [
          { model: Product, as: "product" }, // Incluir el modelo Product
          { model: Business, as: "business" }, // Incluir el modelo Business
          { model: Person, as: "person" }, // Incluir el modelo Person
        ],
      });

      // Mapear los resultados para obtener solo los datos necesarios
      const mappedProducts = productRecipes.map((productRecipe) => ({
        id: productRecipe.id,
        recipe_id: productRecipe.recipe_id,
        product_id: productRecipe.product_id,
        product_name: productRecipe.product.name, // Nombre del producto
        business_id: productRecipe.business_id,
        business_name: productRecipe.business.name, // Nombre del negocio
        person_id: productRecipe.person_id,
        person_name: productRecipe.person.name, // Nombre de la persona
        cant: productRecipe.cant,
      }));

      return mappedProducts;
    } catch (error) {
      logger.error("Error al obtener productos por receta:", error);
      throw error;
    }
  },

  /**
   * Elimina una relación entre un producto y una receta.
   * @param {number} id - ID de la relación en product_recipes.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async deleteProductRecipe(id, t = null) {
    try {
      const productRecipe = await ProductRecipe.findByPk(id, {
        transaction: t,
      });

      if (productRecipe) {
        await productRecipe.destroy({ transaction: t });
        logger.info("Relación producto-receta eliminada exitosamente.");
      }

      return productRecipe;
    } catch (error) {
      logger.error("Error al eliminar la relación producto-receta:", error);
      throw error;
    }
  },

  /**
   * Actualiza múltiples relaciones producto-receta por sus IDs.
   * @param {Array} updatesArray - Array de objetos con id y cant.
   * @param {object} t - Transacción de Sequelize (opcional).
   */
  async updateQuantitiesById(updatesArray, t = null) {
    try {
      for (const update of updatesArray) {
        const { id, cant } = update;

        // Buscar la relación por ID
        const productRecipe = await ProductRecipe.findByPk(id, {
          transaction: t,
        });

        if (productRecipe) {
          // Actualizar la cantidad
          productRecipe.cant = cant;
          await productRecipe.save({ transaction: t });
        }
      }

      logger.info("Cantidades actualizadas exitosamente por id.");
    } catch (error) {
      logger.error("Error al actualizar cantidades por id:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las relaciones producto-receta para un negocio y persona específicos.
   * @param {number} business_id - ID del negocio.
   * @param {number} person_id - ID de la persona.
   * @returns {Array} - Array de relaciones producto-receta.
   */
  async getProductRecipesByBusinessAndPerson(business_id, person_id) {
    try {
      const productRecipes = await ProductRecipe.findAll({
        where: { business_id, person_id },
        include: [
          { model: Product, as: "product" },
          { model: Recipe, as: "recipe" },
        ],
      });

      // Mapear los resultados para obtener solo los datos necesarios
      const mappedProductRecipes = productRecipes.map((productRecipe) => ({
        id: productRecipe.id,
        recipe_id: productRecipe.recipe_id,
        recipe_name: productRecipe.recipe.name, // Nombre de la receta
        product_id: productRecipe.product_id,
        product_name: productRecipe.product.name, // Nombre del producto
        cant: productRecipe.cant,
      }));

      return mappedProductRecipes;
    } catch (error) {
      logger.error(
        "Error al obtener relaciones producto-receta por negocio y persona:",
        error
      );
      throw error;
    }
  },
};

module.exports = ProductRecipeRepository;
