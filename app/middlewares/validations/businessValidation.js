const Joi = require('joi');

// Validación para crear una nueva empresa
const storeBusinessSchema = Joi.object({
    name: Joi.string().max(255).required(),
    cnpj: Joi.string().max(50).required(),
    email: Joi.string().email().allow(null).empty('').optional(), // nullable
    address: Joi.string().allow(null).empty('').optional(),
    phone: Joi.string().max(20).allow(null).empty('').optional(),
    image: Joi.any()
        .custom((value, helpers) => {
            if (value) {
                // Validar tipo MIME
                const validMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
                const fileType = value.type;

                if (!validMimeTypes.includes(fileType)) {
                    return helpers.message('El archivo debe ser una imagen válida (jpg, jpeg, png, gif)');
                }

                // Validar tamaño (500 KB)
                const maxSize = 500 * 1024;  // 500 KB
                if (value.size > maxSize) {
                    return helpers.message('El archivo debe ser una imagen válida de máximo 500 KB');
                }
            }
            return value;
        })
        .allow(null).optional() // Permite que sea nulo u opcional
        .messages({
            'any.required': 'El campo image es obligatorio.',
        }),
        parent_id: Joi.number().integer().allow(null, '').optional().empty(null)
});

// Validación para actualizar una empresa
const updateBusinessSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().max(255).allow(null).empty('').optional(),
    cnpj: Joi.string().max(50).allow(null).empty('').optional(),
    address: Joi.string().allow(null).empty('').optional(),
    email: Joi.string().email().allow(null).empty('').optional(), // nullable
    phone: Joi.string().max(20).allow(null).empty('').optional(),
    image: Joi.any()
        .custom((value, helpers) => {
            if (value) {
                // Validar tipo MIME
                const validMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
                const fileType = value.type;

                if (!validMimeTypes.includes(fileType)) {
                    return helpers.message('El archivo debe ser una imagen válida (jpg, jpeg, png, gif)');
                }

                // Validar tamaño (500 KB)
                const maxSize = 500 * 1024;  // 500 KB
                if (value.size > maxSize) {
                    return helpers.message('El archivo debe ser una imagen válida de máximo 500 KB');
                }
            }
            return value;
        })
        .allow(null).optional() // Permite que sea nulo u opcional
        .messages({
            'any.required': 'El campo image es obligatorio.',
        }),
        parent_id: Joi.number().integer().allow(null, '').optional().empty(null)
});

// Validación para obtener una empresa por ID
const idBusinessSchema = Joi.object({
    id: Joi.number().required(),
});


module.exports = {
    storeBusinessSchema,
    updateBusinessSchema,
    idBusinessSchema,
};
