const Joi = require("joi");

// Esquema para crear una nueva receta
const storeRecipeSchema = Joi.object({
  name: Joi.string().max(500).required().messages({
    "string.max": '"name" no puede exceder los 500 caracteres',
    "string.empty": '"name" no puede estar vacío',
    "any.required": '"name" es un campo obligatorio',
  }),
  description: Joi.string().max(500).allow(null).empty("").optional().messages({
    "string.max": '"description" no puede exceder los 500 caracteres',
  }),
  image: Joi.string()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .allow(null)
    .empty("")
    .optional()
    .custom((value, helpers) => {
      const maxSize = 500 * 1024; // 500 KB
      if (value && value.length > maxSize) {
        return helpers.message("La imagen no debe superar los 500 KB");
      }
      return value;
    })
    .messages({
      "string.pattern.base":
        "Formato de imagen inválido (solo JPG, JPEG, PNG, GIF, WEBP)",
    }),
  business_id: Joi.number().integer().required().messages({
    "number.base": '"business_id" debe ser un número',
    "number.integer": '"business_id" debe ser un entero',
    "any.required": '"business_id" es un campo obligatorio',
  }),
});

// Esquema para actualizar una receta
const updateRecipeSchema = Joi.object({
  name: Joi.string().max(500).allow(null).empty("").optional().messages({
    "string.max": '"name" no puede exceder los 500 caracteres',
  }),
  description: Joi.string().max(500).allow(null).empty("").optional().messages({
    "string.max": '"description" no puede exceder los 500 caracteres',
  }),
  image: Joi.string()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .allow(null)
    .empty("")
    .optional()
    .custom((value, helpers) => {
      const maxSize = 500 * 1024; // 500 KB
      if (value && value.length > maxSize) {
        return helpers.message("La imagen no debe superar los 500 KB");
      }
      return value;
    })
    .messages({
      "string.pattern.base":
        "Formato de imagen inválido (solo JPG, JPEG, PNG, GIF, WEBP)",
    }),
  business_id: Joi.number()
    .integer()
    .allow(null)
    .empty("")
    .optional()
    .messages({
      "number.base": '"business_id" debe ser un número',
      "number.integer": '"business_id" debe ser un entero',
    }),
  person_id: Joi.number().integer().allow(null).empty("").optional().messages({
    "number.base": '"person_id" debe ser un número',
    "number.integer": '"person_id" debe ser un entero',
  }),
  id: Joi.number().integer().required().messages({
    "number.base": '"id" debe ser un número',
    "number.integer": '"id" debe ser un entero',
    "any.required": '"id" es requerido para actualización',
  }),
});

// Esquema para operaciones que requieren ID
const idRecipeSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": '"id" debe ser un número',
    "number.integer": '"id" debe ser un entero',
    "any.required": "Se requiere un ID válido",
  }),
});

// Esquema para búsqueda por business_id y person_id
const filterRecipeSchema = Joi.object({
  business_id: Joi.number().integer().required().messages({
    "number.base": '"business_id" debe ser un número',
    "number.integer": '"business_id" debe ser un entero',
    "any.required": '"business_id" es un campo obligatorio',
  }),
  person_id: Joi.number().integer().optional().messages({
    "number.base": '"person_id" debe ser un número',
    "number.integer": '"person_id" debe ser un entero',
  }),
  cursor: Joi.number().integer().allow(null).empty("").optional(),
  pageSize: Joi.number().integer().allow(null).empty("").optional(),
});

module.exports = {
  storeRecipeSchema,
  updateRecipeSchema,
  idRecipeSchema,
  filterRecipeSchema,
};
