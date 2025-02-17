const Joi = require('joi');

// Esquema para crear un nuevo registro en el almacén
const storeWarehouseSchema = Joi.object({
  product_id: Joi.number().integer().allow(null).empty('').optional().messages({
    'number.base': '"product_id" debe ser un número',
    'number.integer': '"product_id" debe ser un entero',
  }),
  name: Joi.string().max(500).allow(null).empty('').optional().messages({
    'string.max': '"description" no puede exceder los 500 caracteres'
  }),
  business_id: Joi.number().integer().required().messages({
    'number.base': '"business_id" debe ser un número',
    'number.integer': '"business_id" debe ser un entero',
    'any.required': '"business_id" es un campo obligatorio'
  }),
  name: Joi.string().max(500).allow(null).empty('').optional().messages({
    'string.max': '"description" no puede exceder los 500 caracteres'
  }),
  expirationDate: Joi.date().iso().allow(null).empty('').optional().messages({
    'date.base': '"expirationDate" debe ser una fecha válida en formato ISO (YYYY-MM-DD)'
  }),
  description: Joi.string().max(500).allow(null).empty('').optional().messages({
    'string.max': '"description" no puede exceder los 500 caracteres'
  }),
  measure: Joi.string().max(50).allow(null).empty('').optional().messages({
    'string.max': '"measure" no puede exceder los 50 caracteres'
  }),
  total: Joi.number().integer().min(0).allow(null).empty('').optional().messages({
    'number.base': '"total" debe ser un número',
    'number.integer': '"total" debe ser un entero',
    'number.min': '"total" no puede ser negativo'
  }),
  image: Joi.string()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .allow(null).empty('').optional()
    .custom((value, helpers) => {
      const maxSize = 500 * 1024; // 500 KB
      if (value && value.length > maxSize) {
        return helpers.message('La imagen no debe superar los 500 KB');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Formato de imagen inválido (solo JPG, JPEG, PNG, GIF, WEBP)'
    })
});

// Esquema para actualizar un registro en el almacén
const updateWarehouseSchema = Joi.object({
  product_id: Joi.number().integer().allow(null).empty('').optional().messages({
    'number.base': '"product_id" debe ser un número',
    'number.integer': '"product_id" debe ser un entero'
  }),
  business_id: Joi.number().integer().allow(null).empty('').optional().messages({
    'number.base': '"business_id" debe ser un número',
    'number.integer': '"business_id" debe ser un entero'
  }),
  name: Joi.string().max(500).allow(null).empty('').optional().messages({
    'string.max': '"description" no puede exceder los 500 caracteres'
  }),
  expirationDate: Joi.date().iso().allow(null).empty('').optional(),
  description: Joi.string().max(500).allow(null).empty('').optional(),
  measure: Joi.string().max(50).allow(null).empty('').optional(),
  total: Joi.number().integer().min(0).allow(null).empty('').optional(),
  image: Joi.string()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .allow(null).empty('').optional()
    .custom((value, helpers) => {
      const maxSize = 500 * 1024;
      if (value && value.length > maxSize) {
        return helpers.message('La imagen no debe superar los 500 KB');
      }
      return value;
    }),
  id: Joi.number().integer().required().messages({
    'number.base': '"id" debe ser un número',
    'number.integer': '"id" debe ser un entero',
    'any.required': '"id" es requerido para actualización'
  })
});

// Esquema para operaciones que requieren ID
const idWarehouseSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': '"id" debe ser un número',
    'number.integer': '"id" debe ser un entero',
    'any.required': 'Se requiere un ID válido'
  })
});

// Esquema para búsqueda por business_id y product_id
const filterWarehouseSchema = Joi.object({
  business_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().optional(),
  cursor: Joi.number().integer().allow(null).empty('').optional(),
  pageSize: Joi.number().integer().allow(null).empty('').optional(),
});

module.exports = {
  storeWarehouseSchema,
  updateWarehouseSchema,
  idWarehouseSchema,
  filterWarehouseSchema
};