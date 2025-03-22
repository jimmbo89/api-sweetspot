const Joi = require('joi');

// Esquema para crear una relación entre un plato (dish) y una receta (recipe)
const storeDishRecipeSchema = Joi.object({
    recipe_id: Joi.number().required(), // ID de la receta
    dish_id: Joi.number().required(), // ID del plato
    business_id: Joi.number().required(), // ID del negocio
    quantity: Joi.number().positive().required(), // La cantidad debe ser un número positivo
    type: Joi.string().required(), // Tipo de relación
});

// Esquema para actualizar una relación entre un plato y una receta
const updateDishRecipeSchema = Joi.object({
    id: Joi.number().required(), // ID de la relación
    quantity: Joi.number().positive().optional(), // La cantidad debe ser un número positivo
    type: Joi.string().optional(), // Tipo de relación
});

// Esquema para asociar un array de platos a una receta
const assignRecipesToDishSchema = Joi.object({
    dish_id: Joi.number().required(), // ID de la receta
    business_id: Joi.number().required(), // ID del negocio
    dishes: Joi.array().items(
        Joi.object({
            recipe_id: Joi.number().required(), // ID del plato
            quantity: Joi.number().positive().required(), // Cantidad del plato
            type: Joi.string().required(), // Tipo de relación
        })
    ).required(), // Array de platos con sus cantidades y tipos
});

// Esquema para validar el ID de una relación
const idDishRecipeSchema = Joi.object({
    id: Joi.number().required(), // ID de la relación
});

// Esquema para validar el ID de una receta
const idDishSchema = Joi.object({
    dish_id: Joi.number().required(), // ID de la receta
});

module.exports = {
    storeDishRecipeSchema,
    updateDishRecipeSchema,
    assignRecipesToDishSchema,
    idDishRecipeSchema,
    idDishSchema
};