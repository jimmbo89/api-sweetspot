const Joi = require('joi');

// Esquema para crear un nuevo producto
const storeProductSchema = Joi.object({
    name: Joi.string().max(255).required(), // El nombre es obligatorio y debe ser una cadena de texto
});

// Esquema para actualizar un producto existente
const updateProductSchema = Joi.object({
    name: Joi.string().max(255).allow(null).empty('').optional(), // El nombre es opcional y puede ser nulo o vacío
    id: Joi.number().required(), // El ID es obligatorio para identificar el producto a actualizar
});

// Esquema para validar el ID de un producto
const idProductSchema = Joi.object({
    id: Joi.number().required(), // El ID es obligatorio y debe ser un número
});

module.exports = {
    storeProductSchema, // Esquema para crear un producto
    updateProductSchema, // Esquema para actualizar un producto
    idProductSchema, // Esquema para validar el ID de un producto
};