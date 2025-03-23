const { Op } = require('sequelize');
const { BusinessPerson, Person, Role, User } = require('../models'); // Aquí usamos el modelo BusinessPerson
const logger = require('../../config/logger'); // Logger para seguimiento

const BusinessPersonRepository = {
  // Obtener todas las relaciones de business_Person
  async findAll() {
    return await BusinessPerson.findAll({
      attributes: ['id', 'business_id', 'person_id', 'role_id', 'active', 'pix', 'type', 'name', 'bank', 'workplace'],
      include: [
        {
          model: Person, // Incluir datos de la persona
          as: 'person',
          attributes: ['id', 'name', 'email', 'phone'], // Selecciona los campos que necesitas
        },
        {
          model: Role, // Incluir datos del rol
          as: 'role',
          attributes: ['id', 'name'], // Selecciona los campos que necesitas
        },
      ],
    });
  },

  // Buscar una relación de BusinessPerson por ID con datos de Person y Role
  async findById(id) {
    return await BusinessPerson.findByPk(id, {
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
          model: Person, // Incluir datos de la persona
          as:'person',
          attributes: ["id", "name", "email", "image"], // Selecciona los campos que necesitas
          include: [
            {
              model: User,
              as:'user',
              attributes: ["id", "name",],
            },
          ],
        },
        {
          model: Role, // Incluir datos del rol
          as:'role',
          attributes: ["id", "name", "type"], // Selecciona los campos que necesitas
        },
      ],
    });
  },

  // Obtener trabajadores asociados a un business_id con datos de Person y Role
  async findWorkersByBusinessId(businessId) {
    return await BusinessPerson.findAll({
      where: { business_id: businessId }, // Filtra por business_id
      attributes: ['id', 'business_id', 'person_id', 'role_id', 'active', 'pix', 'type', 'name', 'bank', 'workplace'],
      include: [
        {
          model: Person, // Incluir datos de la persona
          as:'person',
          include: [
            {
              model: User,
              as:'user',
              attributes: ["id", "name",],
            },
          ],
        },
        {
          model: Role, // Incluir datos del rol
          as:'role',
          attributes: ["id", "name", "type"], // Selecciona los campos que necesitas
        },
      ],
    });
  },

  // Buscar una relación de business_Person por business_id, person_id y role_id
  async existsByFields(business_id, person_id, excludeId = null) {
    const whereCondition = excludeId
      ? { business_id, person_id, id: { [Op.ne]: excludeId } }
      : { business_id, person_id };
    return await BusinessPerson.findOne({ where: whereCondition });
  },

  // Crear una nueva relación de business_Person
  async create(body, t) {
    const { business_id, person_id, role_id, active, pix, type, name, bank, workplace } = body;

    const businessPerson = await BusinessPerson.create({
      business_id,
      person_id,
      role_id,
      active,
      pix,
      type,
      name,
      bank,
      workplace
    }, {transaction: t});

    return businessPerson;
  },

  // Actualizar una relación de business_Person
  async update(businessPerson, body) {
    const fieldsToUpdate = ['business_id', 'person_id', 'role_id', 'active', 'pix', 'type', 'name', 'bank', 'workplace'];

    const updatedData = Object.keys(body)
      .filter(key => fieldsToUpdate.includes(key) && body[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    if (Object.keys(updatedData).length > 0) {
      await businessPerson.update(updatedData);
      logger.info(`Relación de business_Person actualizada exitosamente (ID: ${businessPerson.id})`);
    }

    return businessPerson;
  },

  // Eliminar una relación de business_Person
  async delete(businessPerson) {
    return await businessPerson.destroy();
  },

};

module.exports = BusinessPersonRepository;
