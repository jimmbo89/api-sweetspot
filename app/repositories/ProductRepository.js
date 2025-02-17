const { Op } = require('sequelize');
const { Product } = require('../models'); // Importamos el modelo Product
const logger = require('../../config/logger'); // Logger para seguimiento

const ProductRepository = {
  // Obtener todos los productos
  async findAll() {
    return await Product.findAll({
      attributes: ['id', 'name'], // Seleccionamos solo los campos necesarios
    });
  },

  // Buscar un producto por ID
  async findById(id) {
    return await Product.findByPk(id, {
      attributes: ['id', 'name'], // Seleccionamos solo los campos necesarios
    });
  },

  // Verificar si un producto existe por nombre (útil para evitar duplicados)
  async existsByName(name, excludeId = null) {
    const whereCondition = excludeId
      ? { name, id: { [Op.ne]: excludeId } } // Excluir un ID específico
      : { name }; // Buscar solo por nombre
    return await Product.findOne({ where: whereCondition });
  },

  // Crear un nuevo producto
  async create(body, t) {
    const { name } = body;
    try {
      // Ejemplo de uso en una operación compleja
      const product = await Product.create(
          { name: name }, 
          {transaction: t}
      );
    
      logger.info(`Producto creado exitosamente (ID: ${product.id})`);
    return product;
  } catch (error) {
    logger.error(`Error en ProductRepository->store: ${err.message}`);
    throw err; // Propagar el error para que el rollback se ejecute
  }
  },

  // Actualizar un producto
  async update(product, body, t) {
    const fieldsToUpdate = ['name']; // Campos permitidos para actualizar
    try {
    const updatedData = Object.keys(body)
      .filter((key) => fieldsToUpdate.includes(key) && body[key] !== undefined) // Filtramos campos válidos
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    if (Object.keys(updatedData).length > 0) {
      await product.update(updatedData, {transaction: t});
      logger.info(`Producto actualizado exitosamente en el repository (ID: ${product.id})`);
    }

    return product;
  } catch (err) {
    logger.error(`Error en ProductRepository->update: ${err.message}`);
    throw err; // Propagar el error para que el rollback se ejecute
  }
  },

  // Eliminar un producto
  async delete(product) {
    await product.destroy();
    logger.info(`Producto eliminado exitosamente (ID: ${product.id})`);
  },
};

module.exports = ProductRepository;