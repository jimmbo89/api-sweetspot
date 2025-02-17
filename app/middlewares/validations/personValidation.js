const Joi = require("joi");

// Validación para crear una nueva persona
const storePersonSchema = Joi.object({
  name: Joi.string().max(255).required(),
  email: Joi.string().email().allow(null).empty("").optional(), // nullable
  user: Joi.string().allow(null).empty("").optional(), // nullable
  password: Joi.string().required(),
  cpf: Joi.string().max(20).required(),
  address: Joi.string().allow(null).empty("").optional(),
  phone: Joi.string().max(20).allow(null).empty("").optional(),
  business_id: Joi.number().allow(null).empty('').optional(),
  role_id: Joi.number().integer().required(),
  active: Joi.number().integer().valid(0, 1).default(1), // 1 por defecto, solo valores 0 o 1
  pix: Joi.string().allow(null, "").optional(),
  type: Joi.string().allow(null, "").optional(),
  name: Joi.string().max(255).allow(null, "").optional(),
  bank: Joi.string().allow(null, "").optional(),
  workplace: Joi.number().required(),
  image: Joi.any()
    .custom((value, helpers) => {
      if (value) {
        // Validar tipo MIME
        const validMimeTypes = [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];
        const fileType = value.type;

        if (!validMimeTypes.includes(fileType)) {
          return helpers.message(
            "El archivo debe ser una imagen válida (jpg, jpeg, png, gif)"
          );
        }

        // Validar tamaño (500 KB)
        const maxSize = 500 * 1024; // 500 KB
        if (value.size > maxSize) {
          return helpers.message(
            "El archivo debe ser una imagen válida de máximo 500 KB"
          );
        }
      }
      return value;
    })
    .allow(null)
    .optional() // Permite que sea nulo u opcional
    .messages({
      "any.required": "El campo image es obligatorio.",
    }),
});

// Validación para actualizar una persona
const updatePersonSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().max(255).allow(null).empty("").optional(),
  email: Joi.string().email().allow(null).empty("").optional(),
  cpf: Joi.string().max(20).allow(null).empty("").optional(),
  user_id: Joi.number().integer().allow(null).empty("").optional(),
  user: Joi.string().allow(null).empty("").optional(), // nullable
  address: Joi.string().allow(null).empty("").optional(),
  phone: Joi.string().max(20).allow(null).empty("").optional(),
  business_id: Joi.number().allow(null).empty('').optional(),
  role_id: Joi.number().integer().required(),
  active: Joi.number().integer().valid(0, 1).default(1), // 1 por defecto, solo valores 0 o 1
  pix: Joi.string().allow(null, "").optional(),
  type: Joi.string().allow(null, "").optional(),
  name: Joi.string().max(255).allow(null, "").optional(),
  bank: Joi.string().allow(null, "").optional(),
  workplace: Joi.number().required(),
  image: Joi.any()
    .custom((value, helpers) => {
      if (value) {
        // Validar tipo MIME
        const validMimeTypes = [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];
        const fileType = value.type;

        if (!validMimeTypes.includes(fileType)) {
          return helpers.message(
            "El archivo debe ser una imagen válida (jpg, jpeg, png, gif)"
          );
        }

        // Validar tamaño (500 KB)
        const maxSize = 500 * 1024; // 500 KB
        if (value.size > maxSize) {
          return helpers.message(
            "El archivo debe ser una imagen válida de máximo 500 KB"
          );
        }
      }
      return value;
    })
    .allow(null)
    .optional() // Permite que sea nulo u opcional
    .messages({
      "any.required": "El campo image es obligatorio.",
    }),
});

// Validación para obtener una persona por ID
const idPersonSchema = Joi.object({
  id: Joi.number().required(),
});

const idBusinessIdSchema = Joi.object({
  business_id: Joi.number().integer().allow(null).empty("").optional(),
});

module.exports = {
  storePersonSchema,
  updatePersonSchema,
  idPersonSchema,
  idBusinessIdSchema
};
