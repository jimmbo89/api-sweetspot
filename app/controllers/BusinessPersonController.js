const { username } = require("../../config/database");
const logger = require("../../config/logger"); // Importa el logger
const { sequelize } = require("../models");
const {
  BusinessPersonRepository,
  BusinessRepository,
  RoleRepository,
  PersonRepository,
  AuthRepository,
} = require("../repositories"); // Asegúrate de importar el repositorio de BusinessPerson

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

  async indexByBusiness(req, res) {
    const { business_id } = req.body; // Obtener el business_id desde los query parameters
    logger.info(
      `${req.user.name} - Accediendo a la lista de trabajadores del business ${business_id}`
    );

    try {
      // Obtener los trabajadores asociados al business_id
      const businesspeople =
        await BusinessPersonRepository.findWorkersByBusinessId(business_id);

      const businesspeopleMaped = businesspeople.map((businessperson) => ({
        id: businessperson.id,
        person_id: businessperson.person_id,
        personId: businessperson.person_id,
        namePerson: businessperson.person.name,
        image: businessperson.person.image,
        cpf: businessperson.person.cpf,
        address: businessperson.person.address,
        email: businessperson.person.email,
        phone: businessperson.person.phone,
        userId: businessperson.person.user_id,
        user_id: businessperson.person.user_id,
        userName: businessperson.person.user.name,
        active: businessperson.active,
        pix: businessperson.pix,
        type: businessperson.type,
        bank: businessperson.bank,
        name: businessperson.name,
        workplace: businessperson.workplace,
        role: businessperson.role.name,
        role_id: businessperson.role_id,
        roleId: businessperson.role_id,
        business_id: businessperson.business_id,
        businessId: businessperson.business_id,
      }));

      // Devolver la lista de trabajadores
      res.status(200).json({ businesspeople: businesspeopleMaped });
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
      logger.error(
        `BusinessPersonController->store: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(400).json({ msg: "BusinessNotFound" });
    }

    const role = await RoleRepository.findById(role_id);
    if (!role) {
      logger.error(
        `BusinessPersonController->store: Rol no encontrado con ID ${role_id}`
      );
      return res.status(400).json({ msg: "RoleNotFound" });
    }
    const existingBusinessPerson =
      await BusinessPersonRepository.existsByFields(business_id, person_id);
    if (existingBusinessPerson.length > 0) {
      logger.error(
        `BusinessPersonController->store: La persona ya esta asociada con el negocio: ${existingBusinessPerson.join(
          ", "
        )}`
      );
      return res
        .status(400)
        .json({ msg: "Persona ya relacionada con el negocio" });
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
      logger.error(
        "Error en BusinessPersonController->store: " + error.message
      );
      res.status(500).json({ error: "ServerError" });
    }
  },

  async store_person(req, res) {
    logger.info(
      `${req.user.name} - Creando una nueva relación de business_people`
    );
    logger.info("datos recibidos al asociar una persona a un negocio:");
      logger.info(JSON.stringify(req.body));

    const {
      business_id,
      role_id,
      namePerson,
      cpf,
      email,
      phone,
      address,
      userName,
      user_id,
      active,
      pix,
      type,
      bank,
      name,
      workplace,
      password,
    } = req.body;
    const business = await BusinessRepository.findById(business_id);
    if (!business) {
      logger.error(
        `BusinessPersonController->store: Negocio no encontrado con ID ${business_id}`
      );
      return res.status(400).json({ msg: "BusinessNotFound" });
    }

    const role = await RoleRepository.findById(role_id);
    if (!role) {
      logger.error(
        `BusinessPersonController->store: Rol no encontrado con ID ${role_id}`
      );
      return res.status(400).json({ msg: "RoleNotFound" });
    }
    /*const existingBusinessPerson = await BusinessPersonRepository.existsByFields(business_id, person_id);
    if (existingBusinessPerson.length > 0) {
      logger.error(`BusinessPersonController->store: La persona ya esta asociada con el negocio: ${existingBusinessPerson.join(", ")}`);
      return res.status(400).json({ msg: "Persona ya relacionada con el negocio" });
    }*/
    if ((userName, email, cpf)) {
      const existingPerson = await PersonRepository.existsByEmailOrCpf(
        email,
        cpf,
        userName
      );
      if (existingPerson) {
        const conflictField = existingPerson.email === email ? "email" : "cpf";
        logger.error(
          `El ${conflictField} ya está registrado en otro trabajador: ${existingPerson[conflictField]}`
        );
        return res.status(400).json({
          error: `Duplicate${
            conflictField.charAt(0).toUpperCase() + conflictField.slice(1)
          }`,
          msg: `El ${conflictField} ya está registrado con otro trabajador.`,
        });
      }
    }
    const t = await sequelize.transaction();
    try {
      // Supongamos que tienes los siguientes datos
      const userData = {
        email: email, // Correo electrónico
        password: password, // Contraseña
        name: userName, // Nombre del usuario (opcional)
      };
      const userNew = await AuthRepository.store(userData, t);
      req.body.user_id = userNew.id;
      const personData = {
        name: namePerson, // Correo electrónico
        email: email, // Correo electrónico
        cpf: cpf,
        phone: phone,
        address: address,
        user_id: userNew.id,
      };
      const person = await PersonRepository.create(personData, req.file, t);
      req.body.person_id = person.id;

      const businessPerson = await BusinessPersonRepository.create(req.body, t);

      await t.commit();
      res.status(201).json({ msg: "BusinessPersonCreated", businessPerson });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      logger.error(
        "Error en BusinessPersonController->store: " + error.message
      );
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
    const { business_id, person_id, role_id, user_id } = req.body;
    if (business_id) {
      const business = await BusinessRepository.findById(business_id);
      if (!business) {
        logger.error(
          `BusinessPersonController->update: Negocio no encontrado con ID ${business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    if (role_id) {
      const role = await RoleRepository.findById(role_id);
      if (!role) {
        logger.error(
          `BusinessPersonController->update: Rol no encontrado con ID ${role_id}`
        );
        return res.status(400).json({ msg: "RoleNotFound" });
      }
    }
    try {
      const businessPerson = await BusinessPersonRepository.findById(
        req.body.id
      );
      if (!businessPerson) {
        return res.status(204).json({ msg: "BusinessPersonNotFound" });
      }

      const businessPersonUpdate = await BusinessPersonRepository.update(
        businessPerson,
        req.body
      );

      res
        .status(200)
        .json({ msg: "BusinessPersonUpdated", businessPersonUpdate });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(
        `BusinessPersonController->update: Error al actualizar la relación: ${errorMsg}`
      );
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async update_person(req, res) {
    logger.info(`${req.user.name} - Editando una relación de business_people`);
    logger.info("datos recibidos al editar una persona a un negocio:");
    logger.info(JSON.stringify(req.body));
    const { business_id, person_id, role_id, user_id, namePerson, cpf, email, phone, address, userName, } = req.body;
    let user = [];
    let person = [];    
    const businessPerson = await BusinessPersonRepository.findById(
      req.body.id
    );
    if (!businessPerson) {
      return res.status(204).json({ msg: "BusinessPersonNotFound" });
    }
    if (business_id) {
      const business = await BusinessRepository.findById(business_id);
      if (!business) {
        logger.error(
          `BusinessPersonController->update_person: Negocio no encontrado con ID ${business_id}`
        );
        return res.status(400).json({ msg: "BusinessNotFound" });
      }
    }

    if (role_id) {
      const role = await RoleRepository.findById(role_id);
      if (!role) {
        logger.error(
          `BusinessPersonController->update_person: Rol no encontrado con ID ${role_id}`
        );
        return res.status(400).json({ msg: "RoleNotFound" });
      }
    }

    if (user_id) {
      user = await AuthRepository.findById(user_id);
      if (!user) {
        logger.error(
          `BusinessPersonController->update_person: Usuario no encontrado con ID ${user_id}`
        );
        return res.status(400).json({ msg: "UserNotFound" });
      }
    }

    if (person_id) {
      person = await PersonRepository.findById(person_id);
      if (!person) {
        logger.error(
          `BusinessPersonController->update_person: Persona no encontrada con ID ${person_id}`
        );
        return res.status(400).json({ msg: "PersonNotFound" });
      }
    }
    try {
      if (user && (email || userName)) {
        const existingPerson = await PersonRepository.existsByEmailOrCpf(
          email,
          cpf,
          userName,
          person_id,
          user_id
        );
        if (existingPerson) {
          const conflictField =
            existingPerson.email === email ? "email" : "cpf";
          logger.error(
            `El ${conflictField} ya está registrado en otro trabajador: ${existingPerson[conflictField]}`
          );
          return res.status(400).json({
            error: `Duplicate${
              conflictField.charAt(0).toUpperCase() + conflictField.slice(1)
            }`,
            msg: `El ${conflictField} ya está registrado con otro trabajador.`,
          });
        }
        logger.info(`Actualizando usuario con ID ${user_id}`);
        // Supongamos que tienes los siguientes datos
        const userData = {
          email: email, // Correo electrónico
          name: userName, // Nombre del usuario (opcional)
        };
        const updatedUser = await AuthRepository.update(user, userData);
      }
      if (
        person &&
        (namePerson || cpf || email || address || phone)
      ) {
        logger.info(`Actualizando persona con ID ${person_id}`);
        const existingPerson = await PersonRepository.existsByEmailOrCpf(
          email,
          cpf,
          userName,
          person_id,
          user_id
        );
        if (existingPerson) {
          const conflictField =
            existingPerson.email === email ? "email" : "cpf";
          logger.error(
            `El ${conflictField} ya está registrado en otro trabajador: ${existingPerson[conflictField]}`
          );
          return res.status(400).json({
            error: `Duplicate${
              conflictField.charAt(0).toUpperCase() + conflictField.slice(1)
            }`,
            msg: `El ${conflictField} ya está registrado con otro trabajador.`,
          });
        }
        const personData = {
          name: namePerson, // Correo electrónico
          email: email, // Correo electrónico
          cpf: cpf,
          phone: phone,
          address: address,
        };
        const updatedPerson = await PersonRepository.update(
          person,
          personData,
          req.file
        );
      }

      const businessPersonUpdate = await BusinessPersonRepository.update(
        businessPerson,
        req.body
      );

      res
        .status(200)
        .json({ msg: "BusinessPersonUpdated", businessPersonUpdate });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(
        `BusinessPersonController->update: Error al actualizar la relación: ${errorMsg}`
      );
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  // Eliminar una relación de business_people
  async destroy(req, res) {
    logger.info(
      `${req.user.name} - Eliminando una relación de business_people`
    );

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
      logger.error(
        `BusinessPersonController->destroy: Error al eliminar la relación: ${errorMsg}`
      );
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
};

module.exports = BusinessPersonController;
