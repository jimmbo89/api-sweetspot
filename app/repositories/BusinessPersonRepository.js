const { Op } = require('sequelize');
const { BusinessPerson } = require('../models'); // Aquí usamos el modelo BusinessPerson
const logger = require('../../config/logger'); // Logger para seguimiento

const BusinessPersonRepository = {
  // Obtener todas las relaciones de business_Person
  async findAll() {
    return await BusinessPerson.findAll({
      attributes: ['id', 'business_id', 'person_id', 'role_id', 'active', 'pix', 'type', 'name', 'bank', 'workplace'],
    });
  },

  // Buscar una relación de business_Person por ID
  async findById(id) {
    return await BusinessPerson.findByPk(id, {
      attributes: ['id', 'business_id', 'person_id', 'role_id', 'active', 'pix', 'type', 'name', 'bank', 'workplace'],
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
