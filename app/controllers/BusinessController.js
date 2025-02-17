const Joi = require('joi');
const { Business, sequelize } = require('../models');
const logger = require('../../config/logger'); // Importa el logger
const { BusinessRepository } = require('../repositories');

const BusinessController = {
    async index(req, res) {
        logger.info(`${req.user.name} - Entra a buscar los negocios`);
    
        try {
            const business = await BusinessRepository.findAll();    
    
            if (!business.length) {
                return res.status(204).json({ msg: 'BusinessNotFound' });
            }
    
            res.status(200).json({ businesses: business });
        } catch (error) {
            const errorMsg = error.details
                ? error.details.map(detail => detail.message).join(', ')
                : error.message || 'Error desconocido';
    
            logger.error('BusinessController->index: ' + errorMsg);
            res.status(500).json({ error: 'ServerError', details: errorMsg });
        }
    },

    async store(req, res) {
        logger.info(`${req.user.name} - Crea un nuevo negocio`);
        logger.info('datos recibidos al crear un negocio');
        logger.info(JSON.stringify(req.body));
        
        const { parent_id } = req.body;
        req.body.user_id = req.user.id;
        if (parent_id) {
            const parentId = await BusinessRepository.findById(parent_id);
             if (!parentId) {
                 logger.error(`BusinessController->store: Business no encontrado con ID ${parent_id}`);
                 return res.status(404).json({ msg: 'BusinessNotFound' });
             }            
        }
        try {
            const business = await BusinessRepository.create(req.body, req.file);
            return res.status(201).json({ msg: 'BusinessStoreOk', business });
        } catch (error) {
            const errorMsg = error.details
                ? error.details.map(detail => detail.message).join(', ')
                : error.message || 'Error desconocido';

            logger.error('BusinessController->store: ' + errorMsg);
            return res.status(500).json({ error: 'ServerError', details: errorMsg });
        }
    },

    async show(req, res) {
        const businessId = req.body.id; // Obtén el ID de la categoría desde los parámetros de la solicitud
        logger.info(`${req.user.name} - Entra a buscar la categoría con ID: ${categoryId}`);
    
        try {

            const business = await BusinessRepository.findById(businessId);

            if (!business.length) {
                return res.status(204).json({ msg: 'BusinessNotFound' });
            }
    
            res.status(200).json({ business: business });
        } catch (error) {
            const errorMsg = error.details
                ? error.details.map(detail => detail.message).join(', ')
                : error.message || 'Error desconocido';
    
            logger.error('BusinessController->show: ' + errorMsg);
            res.status(500).json({ error: 'ServerError', details: errorMsg });
        }
    },

    async update(req, res) {
        logger.info(`${req.user.name} - Editando una categoría`);
        logger.info('datos recibidos al editar una categoría');
        logger.info(JSON.stringify(req.body));
       
        try {
            // Buscar la categoría por ID
            const category = await BusinessRepository.findById(req.body.id);
            if (!category) {
                logger.error(`BusinessController->update: Categoría no encontrada con ID ${req.body.id}`);
                return res.status(404).json({ msg: 'CategoryNotFound' });
            }
    
            const categoryUpdate = await BusinessRepository.update(category, req.body, req.file);
    
            res.status(200).json({ msg: 'CategoryUpdated', category });
    
        } catch (error) {
            // Capturar errores del bloque try y registrarlos
            const errorMsg = error.details
                ? error.details.map(detail => detail.message).join(', ')
                : error.message || 'Error desconocido';
            logger.error(`BusinessController->update: Error al actualizar la categoría: ${errorMsg}`);
            return res.status(500).json({ error: 'ServerError', details: errorMsg });
        }
    },
    
    async destroy(req, res) {
        logger.info(`${req.user.name} - Eliminando una categoría`);
    
        try {
            // Buscar la categoría por ID
            const category = await BusinessRepository.findById(req.body.id);
            if (!category) {
                logger.error(`BusinessController->destroy: Categoría no encontrada con ID ${req.body.id}`);
                return res.status(404).json({ msg: 'CategoryNotFound' });
            }
    
            const categoryDelete = await BusinessRepository.delete(category);
    
            res.status(200).json({ msg: 'CategoryDeleted' });
    
        } catch (error) {
            // Capturar errores del bloque try y registrarlos
            const errorMsg = error.details
                ? error.details.map(detail => detail.message).join(', ')
                : error.message || 'Error desconocido';
            logger.error(`CategoryController->destroy: Error al eliminar la categoría: ${errorMsg}`);
            return res.status(500).json({ error: 'ServerError', details: errorMsg });
        }
    }
    
    
};

module.exports = BusinessController;
