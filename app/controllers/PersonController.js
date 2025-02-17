const Joi = require("joi");
const { sequelize } = require("../models");
const logger = require("../../config/logger"); // Importa el logger
const {
  PersonRepository,
  RoleRepository,
  BusinessRepository,
  AuthRepository,
  BusinessPersonRepository,
} = require("../repositories");
const { sendEmail } = require("../services/emailService");

const PersonController = {
  async index(req, res) {
    logger.info(`${req.user.name} - Entra a buscar las personas`);

    try {
      const people = await PersonRepository.findAll(req.body.business_id);
        logger.info(JSON.stringify(people));
      if (!people.length) {
        return res.status(204).json({ msg: "PersonsNotFound" });
      }

      const mappedPeople = people.map((person) => {
        const businessPeople = person.businessPeople[0]; // Asignar a una variable para facilitar el acceso

        return {
          id: person.id,
          userId: person.user_id,
          user_id: person.user_id,
          roleId: businessPeople ? businessPeople.role_id : null,
          role_id: businessPeople ? businessPeople.role_id : null,
          role: businessPeople ? businessPeople.role.name : "",
          name: person.name,
          email: person.email,
          phone: person.phone,
          cpf: person.cpf,
          address: person.address,
          image: person.image,
          user: person.user.name,
          pix: businessPeople ? businessPeople.pix : "",
          type: businessPeople ? businessPeople.type : "",
          namePix: businessPeople ? businessPeople.name : "",
          bank: businessPeople ? businessPeople.bank : "",
          workplace: businessPeople ? businessPeople.workplace : "",
        };
      });

      res.status(200).json({ people: mappedPeople });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";

      logger.error("PersonController->index: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async store(req, res) {
    logger.info(`${req.user.name} - Crea una nueva persona`);
    logger.info("Datos recibidos al crear una persona");
    logger.info(JSON.stringify(req.body));

    const { business_id, role_id, user, email, cpf } = req.body;

    if ((user, email, cpf)) {
      const existingPerson = await PersonRepository.existsByEmailOrCpf(
        email,
        cpf,
        user
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
    let business = [];
    let role = [];
    if (business_id || role_id) {
      business = await BusinessRepository.findById(business_id);
      if (!business) {
        logger.error(
          `PersonController->store: Negocio no encontrado con ID ${business_id}`
        );
        return res.status(404).json({ msg: "BusinessNotFound" });
      }
      role = await RoleRepository.findById(role_id);
      if (!role) {
        logger.error(
          `PersonController->store: Rol no encontrado con ID ${role_id}`
        );
        return res.status(400).json({ msg: "RoleNotFound" });
      }
    }
    const t = await sequelize.transaction();
    try {
      const user = await AuthRepository.store(req.body, t);
      req.body.user_id = user.id;
      const person = await PersonRepository.create(req.body, req.file, t);
      req.body.person_id = person.id;
      if (business_id) {
        const businessPerson = await BusinessPersonRepository.create(
          req.body,
          t
        );
      }

      const baseUrl = "http://127.0.0.1:8003/api/"; // Cambia esto por tu dominio o URL base
      const userId = user.id; // Asegúrate de tener el ID del usuario disponible
      const verificationLink = `${baseUrl}verify-email/${userId}`;

      const emailResult = await sendEmail({
        to: req.body.email,
        subject: "Bienvenido a nuestra aplicación",
        text: `Hola ${req.body.name}, gracias por unirte. Has sido agregado al negocio "${business.name}" como "${role.name}". Verifica tu correo aquí: ${verificationLink}`,
        html: `
          <p>Hola <b>${req.body.name}</b>,</p>
          <p>Gracias por unirte a nuestra aplicación.</p>
          <p>Has sido agregado al negocio <b>${business.name}</b> con el rol de <b>${role.name}</b>.</p>
          <p>Por favor verifica tu correo haciendo clic en el enlace a continuación:</p>
          <a href="${verificationLink}">Verificar mi correo</a>
          <p>Si no reconoces esta solicitud, puedes ignorar este mensaje.</p>
        `,
      });
      
      await t.commit();
      return res.status(201).json({ msg: "PersonStoreOk", person });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";

      logger.error("PersonController->store: " + errorMsg);
      return res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async show(req, res) {
    const personId = req.body.id; // Obtén el ID de la persona desde los parámetros de la solicitud
    logger.info(
      `${req.user.name} - Entra a buscar la persona con ID: ${personId}`
    );

    try {
      const person = await PersonRepository.findById(personId);

      if (!person) {
        return res.status(204).json({ msg: "PersonNotFound" });
      }

      const businessPeople = person.businessPeople[0]; // Asignar a una variable para facilitar el acceso

      const mappedPerson = {
        id: person.id,
        userId: person.user_id,
        user_id: person.user_id,
        roleId: businessPeople ? businessPeople.role_id : null,
        role_id: businessPeople ? businessPeople.role_id : null,
        role: businessPeople ? businessPeople.role.name : "",
        name: person.name,
        email: person.email,
        phone: person.phone,
        cpf: person.cpf,
        address: person.address,
        image: person.image,
        user: person.user.name,
        pix: businessPeople ? businessPeople.pix : "",
        type: businessPeople ? businessPeople.type : "",
        namePix: businessPeople ? businessPeople.name : "",
        bank: businessPeople ? businessPeople.bank : "",
        workplace: businessPeople ? businessPeople.workplace : "",
      }

      res.status(200).json({ person: mappedPerson });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";

      logger.error("PersonController->show: " + errorMsg);
      res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async update(req, res) {
    logger.info(`${req.user.name} - Editando una persona`);
    logger.info("Datos recibidos al editar una persona");
    logger.info(JSON.stringify(req.body));

    try {
      // Buscar la persona por ID
      const person = await PersonRepository.findById(req.body.id);
      if (!person) {
        logger.error(
          `PersonController->update: Persona no encontrada con ID ${req.body.id}`
        );
        return res.status(404).json({ msg: "PersonNotFound" });
      }

      const personUpdate = await PersonRepository.update(
        person,
        req.body,
        req.file
      );

      res.status(200).json({ msg: "PersonUpdated", person: personUpdate });
    } catch (error) {
      // Capturar errores del bloque try y registrarlos
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(
        `PersonController->update: Error al actualizar la persona: ${errorMsg}`
      );
      return res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async destroy(req, res) {
    logger.info(`${req.user.name} - Eliminando una persona`);

    try {
      // Buscar la persona por ID
      const person = await PersonRepository.findById(req.body.id);
      if (!person) {
        logger.error(
          `PersonController->destroy: Persona no encontrada con ID ${req.body.id}`
        );
        return res.status(404).json({ msg: "PersonNotFound" });
      }

      const personDelete = await PersonRepository.delete(person);

      res.status(200).json({ msg: "PersonDeleted" });
    } catch (error) {
      // Capturar errores del bloque try y registrarlos
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";
      logger.error(
        `PersonController->destroy: Error al eliminar la persona: ${errorMsg}`
      );
      return res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },
};

module.exports = PersonController;
