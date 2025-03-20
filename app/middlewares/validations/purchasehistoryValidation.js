const Joi = require("joi");

// Esquema para crear un nuevo registro en purchase_histories
const storePurchaseHistorySchema = Joi.object({
  business_id: Joi.number().integer().required().messages({
    "number.base": '"business_id" debe ser un número',
    "number.integer": '"business_id" debe ser un entero',
    "any.required": '"business_id" es un campo obligatorio',
  }),
  person_id: Joi.number().integer().required().messages({
    "number.base": '"person_id" debe ser un número',
    "number.integer": '"person_id" debe ser un entero',
    "any.required": '"person_id" es un campo obligatorio',
  }),
  warehouse_id: Joi.number().integer().required().messages({
    "number.base": '"warehouse_id" debe ser un número',
    "number.integer": '"warehouse_id" debe ser un entero',
    "any.required": '"warehouse_id" es un campo obligatorio',
  }),
  price: Joi.number().positive().required().messages({
    "number.base": '"price" debe ser un número',
    "number.positive": '"price" debe ser un número positivo',
    "any.required": '"price" es un campo obligatorio',
  }),
  expirationDate: Joi.date().allow(null).empty("").optional().messages({
    "date.base": '"expirationDate" debe ser una fecha válida',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": '"quantity" debe ser un número',
    "number.integer": '"quantity" debe ser un entero',
    "number.positive": '"quantity" debe ser un número positivo',
    "any.required": '"quantity" es un campo obligatorio',
  }),
  date: Joi.date().default(Date.now).optional().messages({
    "date.base": '"date" debe ser una fecha válida',
  }),
  description: Joi.string().max(500).allow(null).empty("").optional().messages({
    "string.max": '"description" no puede exceder los 500 caracteres',
  }),
  unitType: Joi.string().max(50).allow(null).empty("").optional().messages({
    "string.max": '"unitType" no puede exceder los 50 caracteres',
  }),
});

// Esquema para actualizar un registro en purchase_histories
const updatePurchaseHistorySchema = Joi.object({
  business_id: Joi.number()
    .integer()
    .allow(null)
    .empty("")
    .optional()
    .messages({
      "number.base": '"business_id" debe ser un número',
      "number.integer": '"business_id" debe ser un entero',
    }),
  person_id: Joi.number()
    .integer()
    .allow(null)
    .empty("")
    .optional()
    .messages({
      "number.base": '"person_id" debe ser un número',
      "number.integer": '"person_id" debe ser un entero',
    }),
  warehouse_id: Joi.number()
    .integer()
    .allow(null)
    .empty("")
    .optional()
    .messages({
      "number.base": '"warehouse_id" debe ser un número',
      "number.integer": '"warehouse_id" debe ser un entero',
    }),
  price: Joi.number().positive().allow(null).empty("").optional().messages({
    "number.base": '"price" debe ser un número',
    "number.positive": '"price" debe ser un número positivo',
  }),
  expirationDate: Joi.date().allow(null).empty("").optional().messages({
    "date.base": '"expirationDate" debe ser una fecha válida',
  }),
  quantity: Joi.number().integer().positive().allow(null).empty("").optional().messages({
    "number.base": '"quantity" debe ser un número',
    "number.integer": '"quantity" debe ser un entero',
    "number.positive": '"quantity" debe ser un número positivo',
  }),
  date: Joi.date().allow(null).empty("").optional().messages({
    "date.base": '"date" debe ser una fecha válida',
  }),
  description: Joi.string().max(500).allow(null).empty("").optional().messages({
    "string.max": '"description" no puede exceder los 500 caracteres',
  }),
  unitType: Joi.string().max(50).allow(null).empty("").optional().messages({
    "string.max": '"unitType" no puede exceder los 50 caracteres',
  }),
  id: Joi.number().integer().required().messages({
    "number.base": '"id" debe ser un número',
    "number.integer": '"id" debe ser un entero',
    "any.required": '"id" es requerido para actualización',
  }),
});

// Esquema para operaciones que requieren ID
const idPurchaseHistorySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": '"id" debe ser un número',
    "number.integer": '"id" debe ser un entero',
    "any.required": "Se requiere un ID válido",
  }),
});

// Esquema para búsqueda por business_id, person_id y warehouse_id
const filterPurchaseHistorySchema = Joi.object({
  business_id: Joi.number().integer().required().messages({
    "number.base": '"business_id" debe ser un número',
    "number.integer": '"business_id" debe ser un entero',
    "any.required": '"business_id" es un campo obligatorio',
  }),
  person_id: Joi.number().integer().optional().messages({
    "number.base": '"person_id" debe ser un número',
    "number.integer": '"person_id" debe ser un entero',
  }),
  warehouse_id: Joi.number().integer().optional().messages({
    "number.base": '"warehouse_id" debe ser un número',
    "number.integer": '"warehouse_id" debe ser un entero',
  }),
  cursor: Joi.number().integer().allow(null).empty("").optional(),
  pageSize: Joi.number().integer().allow(null).empty("").optional(),
});

module.exports = {
  storePurchaseHistorySchema,
  updatePurchaseHistorySchema,
  idPurchaseHistorySchema,
  filterPurchaseHistorySchema,
};