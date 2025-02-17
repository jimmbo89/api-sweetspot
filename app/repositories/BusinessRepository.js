const { Op } = require("sequelize");
const { Business, sequelize } = require("../models");
const ImageService = require("../services/ImageService");
const logger = require("../../config/logger"); // Logger para seguimiento

const BusinessRepository = {
  // Obtener todas las categorías jerárquicas
  async findAll() {
    const businesses = await Category.findAll({
      //where: { parent_id: null },
      include: [
        {
          model: Business,
          as: "parent", // Incluir el padre de la categoría
        },
        {
          model: Business,
          as: "children",
          include: [
            {
              model: Business,
              as: "children",
            },
          ],
        },
      ],
    });

    return Promise.all(
      businesses.map(async (business) => ({
        id: business.id,
        name: business.name,
        address: business.address,
        cnpj: business.cnpj,
        phone: business.phone,
        image: business.image,
        parent_id: business.parent_id,
        parent: business.parent ? await this.mapParent(business.parent) : null,
        children: await this.mapChildren(business.children),
      }))
    );
  },

  async findById(id) {
    return await Business.findOne({
      where: { id },
      include: [
        {
          model: Business,
          as: "parent", // Incluir el padre de la categoría
        },
        {
          model: Business,
          as: "children", // Incluir los hijos de la categoría
          include: [
            {
              model: Business,
              as: "children", // Incluir los hijos de los hijos
            },
          ],
        },
      ],
    });
  },

  async mapParent(parent) {
    return {
      id: parent.id,
      name: parent.name,
      address: parent.address,
      cnpj: parent.cnpj,
      phone: parent.phone,
      image: parent.image,
      parent_id: parent.parent_id,
      parent_id: parent.parent_id,
      parent: parent.parent ? await this.mapParent(parent.parent) : null,
    };
  },

  async mapChildren(children) {
    return Promise.all(
      children.map(async (child) => ({
        id: child.id,
        name: child.name,
        address: child.address,
        cnpj: child.cnpj,
        phone: child.phone,
        image: child.image,
        parent_id: child.parent_id,
        children: await this.mapChildren(child.children),
      }))
    );
  },

  async existsBycnpj(cnpj, excludeId = null) {
    const whereClause = excludeId
      ? { cnpj, id: { [Op.ne]: excludeId } }
      : { cnpj };

    return await Business.findOne({ where: whereClause });
  },

  // Crear una nueva categoría con manejo de imágenes
  async create(body, file) {
    logger.info(`Error al crear el negocio Repository`);
    let { name, address, cnpj, phone, parent_id, email, user_id } = body;
    // Validar y corregir parent_id si es inválido o vacío
    if (
      parent_id === "" ||
      parent_id === null ||
      !Number.isInteger(Number(parent_id))
    ) {
      parent_id = null; // Asignar null si el valor no es un entero válido
    }
    // Inicia la transacción
    const t = await sequelize.transaction();
    try {
      // Crear la categoría
      const business = await Business.create(
        {
          name,
          address,
          cnpj,
          email,
          phone,
          user_id,
          image: "businesses/default.jpg", // Imagen predeterminada
          parent_id,
        },
        { transaction: t }
      );
      // Manejar el archivo de icono (si existe)
      if (file) {
        const newFilename = ImageService.generateFilename(
          "businesses",
          business.id,
          file.originalname
        );
        business.image = await ImageService.moveFile(file, newFilename);
        await business.update({ image: business.image }, { transaction: t });
      }

      // Confirmar transacción
      await t.commit();
      return business;
    } catch (error) {
      await t.rollback();
      logger.error(`Error al crear el negocio Repository: ${error.message}`);
      throw new Error(error.message);
    }
  },

  // Actualizar una categoría con manejo de imágenes
  async update(business, body, file) {
    const { name, address, cnpj, phone, parent_id, email } = body;
    const fieldsToUpdate = [
      "name",
      "address",
      "cnpj",
      "phone",
      "parent_id",
      "email"
    ];

    // Validar y corregir parent_id si es inválido o vacío
    if (
      parent_id === "" ||
      parent_id === null ||
      !Number.isInteger(Number(parent_id))
    ) {
      body.parent_id = null; // Asignar null si el valor no es un entero válido
    }

    const updatedData = Object.keys(body)
      .filter((key) => fieldsToUpdate.includes(key) && body[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    // Verificar si se va a actualizar el icono
    if (file) {
        const newFilename = ImageService.generateFilename('businesses', business.id, file.originalname);
        business.image = await ImageService.moveFile(file, newFilename);
        await business.update({ image: business.image });
    }

    if (Object.keys(updatedData).length > 0) {
      await business.update(updatedData);
      logger.info(
        `Negocio actualizado exitosamente: ${business.name} (ID: ${business.id})`
      );
    }

    return business;
  },

  // Eliminar una categoría con manejo de imágenes
  async delete(business) {
    if (business.image && business.image !== 'businesses/default.jpg') {
        await ImageService.deleteFile(business.image);
      }
    logger.info(`Negocio eliminada exitosamente: ${business.id}`);
    // Eliminar la categoría de la base de datos
    return await business.destroy();
  },
};

module.exports = BusinessRepository;
