const { Op } = require("sequelize");
const { Person, BusinessPerson, User, Role, sequelize } = require("../models");
const ImageService = require("../services/ImageService");
const logger = require("../../config/logger"); // Logger para seguimiento

const PersonRepository = {
  // Obtener todas las personas
  async findAll(businessId = null) {
    return await Person.findAll({
      include: [ // Cambié 'includes' a 'include'
        {
          model: BusinessPerson,
          as: "businessPeople",
          where: businessId ? { business_id: businessId } : {}, 
          attributes: [
            "id",
            "business_id",
            "person_id",
            "role_id",
            "active",
            "pix",
            "type",
            "name",
            "bank",
            "workplace",
          ],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  async findById(id) {
    return await Person.findOne({
      where: { id },
      include: [ // Cambié 'includes' a 'include'
        {
          model: BusinessPerson,
          as: "businessPeople",
          attributes: [
            "id",
            "business_id",
            "person_id",
            "role_id",
            "active",
            "pix",
            "type",
            "name",
            "bank",
            "workplace",
          ],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  async existsByEmailOrCpf(email, cpf, user, excludeId = null, userId = null) {
    logger.info(
      "Verificando existencia por email, cpf o usuario en el repositorio"
    );

    let personExists = null;
    let userExists = null;

    // Construir cláusula WHERE para `person` solo si hay `email` o `cpf`
    if (email || cpf) {
      const personWhereClause = {};
      if (email) personWhereClause.email = email;
      if (cpf) personWhereClause.cpf = cpf;
      if (excludeId) personWhereClause.id = { [Op.ne]: excludeId }; // Excluir el ID actual

      personExists = await Person.findOne({ where: personWhereClause });
    }

    // Construir cláusula WHERE para `User` solo si hay `user`
    if (user) {
      const userWhereClause = {};
      userWhereClause.name = user;
      if (userId) userWhereClause.id = { [Op.ne]: userId }; // Excluir el ID del usuario actual

      userExists = await User.findOne({ where: userWhereClause });
    }

    // Retornar true si alguna de las consultas encuentra un registro
    return !!personExists || !!userExists;
  },

  // Crear una nueva persona con manejo de imágenes
  async create(body, file, t) {
    logger.info(`Entra al crear la persona Repository`);
    let { name, email, cpf, phone, address, user_id } = body;

    // Inicia la transacción
    try {
      // Crear la persona
      const person = await Person.create(
        {
          name,
          email,
          cpf,
          phone,
          address,
          user_id,
          image: "people/default.jpg", // Imagen predeterminada
        },
        { transaction: t }
      );

      // Manejar el archivo de imagen (si existe)
      if (file) {
        const newFilename = ImageService.generateFilename(
          "people",
          person.id,
          file.originalname
        );
        person.image = await ImageService.moveFile(file, newFilename);
        await person.update({ image: person.image }, { transaction: t });
      }
      return person;
    } catch (error) {
      logger.error(`Error al crear la persona Repository: ${error.message}`);
      throw new Error(error.message);
    }
  },

  // Actualizar una persona con manejo de imágenes
  async update(person, body, file, t) {
    const { name, email, cpf, phone, address } = body;
    const fieldsToUpdate = ["name", "email", "cpf", "phone", "address"];

    try {
      const updatedData = Object.keys(body)
        .filter(
          (key) => fieldsToUpdate.includes(key) && body[key] !== undefined
        )
        .reduce((obj, key) => {
          obj[key] = body[key];
          return obj;
        }, {});

      // Verificar si se va a actualizar la imagen
      if (file) {
        const newFilename = ImageService.generateFilename(
          "people",
          person.id,
          file.originalname
        );
        person.image = await ImageService.moveFile(file, newFilename);
        await person.update({ image: person.image }, { transaction: t });
      }

      if (Object.keys(updatedData).length > 0) {
        await person.update({ updatedData }, { transaction: t });
        logger.info(
          `Persona actualizada exitosamente: ${person.name} (ID: ${person.id})`
        );
      }

      return person;
    } catch (error) {
      logger.error(`Error al editar la persona Repository: ${error.message}`);
      throw new Error(error.message);
    }
  },

  // Eliminar una persona con manejo de imágenes
  async delete(person) {
    if (person.image && person.image !== "people/default.jpg") {
      await ImageService.deleteFile(person.image);
    }
    logger.info(`Persona eliminada exitosamente: ${person.id}`);
    // Eliminar la persona de la base de datos
    return await person.destroy();
  },
};

module.exports = PersonRepository;
