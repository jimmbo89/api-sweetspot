const Joi = require('joi');

// Esquema para crear una relación entre un producto y una receta
const storeProductRecipeSchema = Joi.object({
    recipe_id: Joi.number().required(),
    product_id: Joi.number().required(),
    business_id: Joi.number().required(),
    person_id: Joi.number().required(),
    cant: Joi.number().positive().required(), // La cantidad debe ser un número positivo
});

// Esquema para actualizar una relación entre un producto y una receta
const updateProductRecipeSchema = Joi.object({
    id: Joi.number().required(), // ID de la relación
    cant: Joi.number().positive().optional(), // La cantidad debe ser un número positivo
});

// Esquema para asociar un array de productos a una receta
const assignProductsToRecipeSchema = Joi.object({
    recipe_id: Joi.number().required(), // ID de la receta
    business_id: Joi.number().required(), // ID del negocio
    products: Joi.array().items(
        Joi.object({
            product_id: Joi.number().required(), // ID del producto
            cant: Joi.number().positive().required(), // Cantidad del producto
        })
    ).required(), // Array de productos con sus cantidades
});

// Esquema para validar el ID de una relación
const idProductRecipeSchema = Joi.object({
    id: Joi.number().required(), // ID de la relación
});

// Esquema para validar el ID de una relación
const idRecipeProductSchema = Joi.object({
    recipe_id: Joi.number().required(), // ID de la relación
});

module.exports = {
    storeProductRecipeSchema,
    updateProductRecipeSchema,
    assignProductsToRecipeSchema,
    idProductRecipeSchema,
    idRecipeProductSchema
};