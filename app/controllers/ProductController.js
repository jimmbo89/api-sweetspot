const logger = require('../../config/logger'); // Importa el logger
const { ProductRepository } = require('../repositories'); // Importa el repositorio de productos

const ProductController = {
  // Listar todos los productos
  async index(req, res) {
    logger.info(`${req.user.name} - Accediendo a la lista de productos`);

    try {
      const products = await ProductRepository.findAll();
      res.status(200).json({ products });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : error.message || 'Error desconocido';
      logger.error('Error en ProductController->index: ' + errorMsg);
      res.status(500).json({ error: 'ServerError', details: errorMsg });
    }
  },

  // Crear un nuevo producto
  async store(req, res) {
    logger.info(`${req.user.name} - Creando un nuevo producto`);

    try {
      const product = await ProductRepository.create(req.body);
      res.status(201).json({ msg: 'ProductCreated', product });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : error.message || 'Error desconocido';
      logger.error('Error en ProductController->store: ' + errorMsg);
      res.status(500).json({ error: 'ServerError', details: errorMsg });
    }
  },

  // Mostrar un producto específico
  async show(req, res) {
    logger.info(`${req.user.name} - Accediendo a un producto específico`);

    try {
      const product = await ProductRepository.findById(req.body.id); // Usamos params en lugar de body
      if (!product) {
        return res.status(404).json({ msg: 'ProductNotFound' });
      }

      res.status(200).json({ product });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : error.message || 'Error desconocido';
      logger.error('ProductController->show: ' + errorMsg);
      res.status(500).json({ error: 'ServerError', details: errorMsg });
    }
  },

  // Actualizar un producto
  async update(req, res) {
    logger.info(`${req.user.name} - Editando un producto`);

    try {
      const product = await ProductRepository.findById(req.body.id); // Usamos params en lugar de body
      if (!product) {
        return res.status(404).json({ msg: 'ProductNotFound' });
      }

      const updatedProduct = await ProductRepository.update(product, req.body);
      res.status(200).json({ msg: 'ProductUpdated', updatedProduct });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : error.message || 'Error desconocido';
      logger.error(`ProductController->update: Error al actualizar el producto: ${errorMsg}`);
      res.status(500).json({ error: 'ServerError', details: errorMsg });
    }
  },

  // Eliminar un producto
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando un producto`);

    try {
      const product = await ProductRepository.findById(req.body.id); // Usamos params en lugar de body
      if (!product) {
        return res.status(404).json({ msg: 'ProductNotFound' });
      }

      await ProductRepository.delete(product);
      res.status(200).json({ msg: 'ProductDeleted' });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : error.message || 'Error desconocido';
      logger.error(`ProductController->destroy: Error al eliminar el producto: ${errorMsg}`);
      res.status(500).json({ error: 'ServerError', details: errorMsg });
    }
  },
};

module.exports = ProductController;