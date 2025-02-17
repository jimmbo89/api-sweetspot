const Joi = require('joi');

// Validación para crear una nueva relación de business_people
const storeBusinessPersonSchema = Joi.object({
    business_id: Joi.number().integer().required(),
    person_id: Joi.number().integer().required(),
    role_id: Joi.number().integer().required(),
    active: Joi.number().integer().valid(0, 1).default(1), // 1 por defecto, solo valores 0 o 1
    pix: Joi.string().allow(null, '').optional(),
    type: Joi.string().allow(null, '').optional(),
    name: Joi.string().max(255).allow(null, '').optional(),
    bank: Joi.string().allow(null, '').optional(),
    workplace: Joi.number().required()  // 1 para propio negocio, 2 para fuera
});

// Validación para actualizar una relación de business_people
const updateBusinessPersonSchema = Joi.object({
    id: Joi.number().required(),
    business_id: Joi.number().allow(null).empty('').optional(),
    person_id: Joi.number().allow(null).empty('').optional(),
    role_id: Joi.number().allow(null).empty('').optional(),
    active: Joi.number().integer().default(1), // 1 por defecto, solo valores 0 o 1
    pix: Joi.string().allow(null, '').optional(),
    type: Joi.string().allow(null, '').optional(),
    name: Joi.string().max(255).allow(null, '').optional(),
    bank: Joi.string().allow(null, '').optional(),
    workplace: Joi.number().allow(null).empty('').optional(),
});

// Validación para obtener una relación de business_people por ID
const idBusinessPersonSchema = Joi.object({
    id: Joi.number().required(),
});

module.exports = {
    storeBusinessPersonSchema,
    updateBusinessPersonSchema,
    idBusinessPersonSchema,
};
