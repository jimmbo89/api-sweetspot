const { Op } = require('sequelize');
const { User, UserToken, Person, sequelize } = require('../models'); // Importamos sequelize desde db
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const logger = require('../../config/logger'); // Logger para seguimiento

const AuthRepository = {
  // Obtener todos los roles
  async register(body, t) {
    try {
        // Generar un hashSync de la contraseña
        let hashedPassword = bcrypt.hashSync(body.password, Number.parseInt(authConfig.rounds));
        const extractedName = body.user ? body.user : body.email.split('@')[0];
        // Crear el usuario con la contraseña encriptada
        const user = await User.create({
        name: extractedName,
        email: body.email,
        password: hashedPassword
        }, { transaction: t });
        
        //logger.info(JSON.stringify(user));
        const person = await Person.create({
            user_id: user.id,
            name: body.name,
            email: body.email,
            address: body.address,
            phone: body.phone,
            cpf: body.cpf,
            image: 'people/default.jpg'
        }, { transaction: t });
                   
        // Creamos el objeto con la información del usuario y la persona
        const userNew = {
            id: user.id,
            email: user.email,
            name: user.name,
            person: {
                id: person.id, // Aquí accedes a la persona creada
                name: person.name
            }
        };
        
        // Creamos el token
        /*const token = jwt.sign({ user: userNew}, authConfig.secret, {
            expiresIn: authConfig.expires
        });

        // Decodificar el token para obtener la fecha de expiración
        const decoded = jwt.decode(token);

        // La fecha de expiración está en el campo 'exp' del JWT
        const expiresAt = new Date(decoded.exp * 1000); // 'exp' es en segundos, así que lo convertimos a milisegundos

         // Guardar el token en la base de datos
        await UserToken.create({
            user_id: user.id,
            token: token,
            expires_at: expiresAt
        }, { transaction: t });*/
        // Respuesta en formato JSON
        return userNew;
    } catch (error) {
        logger.error('Error al registrar usuario AuthRepository: ' + error.message);
        throw error;
    }
  },

  async store(body, t) {
    try {
        // Generar un hashSync de la contraseña
        let hashedPassword = bcrypt.hashSync(body.password, Number.parseInt(authConfig.rounds));
        const extractedName = body.user ? body.user : body.email.split('@')[0];
        // Crear el usuario con la contraseña encriptada
        const user = await User.create({
        name: extractedName,
        email: body.email,
        password: hashedPassword
        }, { transaction: t });
 
        return user;
    } catch (error) {
        logger.error('Error al crear un usuario AuthRepository: ' + error.message);
        throw error;
    }
  },

  async findById(id) {
    return await User.findByPk(id);
  },


  async login() {

  }
  
};

module.exports = AuthRepository;