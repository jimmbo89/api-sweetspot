const logger = require("../../config/logger"); // Importa el logger
const { sequelize } = require('../models');
const { BusinessPersonRepository, BusinessRepository, RoleRepository} = require("../repositories"); // Asegúrate de importar el repositorio de BusinessPerson

const BusinessPersonController = {
  // Listar todas las relaciones de business_people
  async index(req, res) {
    logger.info(`${req.user.name} - Accediendo a la lista de business_people`);

    try {
      const businessPeople = await BusinessPersonRepository.findAll();

      res.status(200).json({ businessPeople: businessPeople });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error("Error en BusinessPersonController->index: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Crear una nueva relación de business_people
  async store(req, res) {
    logger.info(
      `${req.user.name} - Creando una nueva relación de business_people`
    );

    const { business_id, person_id, role_id } = req.body;
    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(`BusinessPersonController->store: Negocio no encontrado con ID ${business_id}`);
      return res.status(400).json({ msg: "BusinessNotFound" });
    }

    const role = await RoleRepository.findById(role_id);
    if (!role) {
      logger.error(`BusinessPersonController->store: Rol no encontrado con ID ${role_id}`);
      return res.status(400).json({ msg: "RoleNotFound" });
    }
    const existingBusinessPerson = await BusinessPersonRepository.existsByFields(business_id, person_id);
    if (existingBusinessPerson.length > 0) {
      logger.error(`BusinessPersonController->store: La persona ya esta asociada con el negocio: ${existingBusinessPerson.join(", ")}`);
      return res.status(400).json({ msg: "Persona ya relacionada con el negocio" });
    }
    const t = await sequelize.transaction();
    try {
      const businessPerson = await BusinessPersonRepository.create(req.body, t);
      await t.commit();
      res.status(201).json({ msg: "BusinessPersonCreated", businessPerson });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      logger.error("Error en BusinessPersonController->store: " + error.message);
      res.status(500).json({ error: "ServerError" });
    }
  },

  // Mostrar una relación específica de business_people
  async show(req, res) {
    logger.info(
      `${req.user.name} - Accediendo a una relación específica de business_people`
    );

    try {
      const businessPerson = await BusinessPersonRepository.findById(
        req.body.id
      );
      if (!businessPerson) {
        return res.status(204).json({ msg: "BusinessPersonNotFound" });
      }

      res.status(200).json({ businessPerson: businessPerson });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error("BusinessPersonController->show: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Actualizar una relación de business_people
  async update(req, res) {
    logger.info(`${req.user.name} - Editando una relación de business_people`);
    const { business_id, person_id, role_id } = req.body;
    if (business_id) {
      const business = await BusinessRepository.findById(business_id);
      if (!business) {
        logger.error(`BusinessPersonController->update: Negocio no encontrado con ID ${business_id}`);
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    if (role_id) {
      const role = await RoleRepository.findById(role_id);
      if (!role) {
        logger.error(`BusinessPersonController->update: Rol no encontrado con ID ${role_id}`);
        return res.status(400).json({ msg: "RoleNotFound" });
      }
    }
    try {
      const businessPerson = await BusinessPersonRepository.findById(req.body.id);
      if (!businessPerson) {
        return res.status(204).json({ msg: "BusinessPersonNotFound" });
      }

      const businessPersonUpdate = await BusinessPersonRepository.update(businessPerson, req.body);

      res.status(200).json({ msg: "BusinessPersonUpdated", businessPersonUpdate });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(`BusinessPersonController->update: Error al actualizar la relación: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Eliminar una relación de business_people
  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando una relación de business_people`);

    try {
      const businessPerson = await BusinessPersonRepository.findById(
        req.body.id
      );
      if (!businessPerson) {
        return res.status(204).json({ msg: "BusinessPersonNotFound" });
      }

      await BusinessPersonRepository.delete(businessPerson);
      res.status(200).json({ msg: "BusinessPersonDeleted" });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(`BusinessPersonController->destroy: Error al eliminar la relación: ${errorMsg}`);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
};

module.exports = BusinessPersonController;
