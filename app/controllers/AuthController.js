const { Op } = require("sequelize");
const { User, UserToken, Person, sequelize } = require("../models"); // Importamos sequelize desde db
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const logger = require("../../config/logger");
const { RoleRepository, AuthRepository } = require("../repositories");
const { sendEmail } = require("../services/emailService");

const AuthController = {
  //registro
  async register(req, res) {
    logger.info("Registrando Usuario.");

    const t = await sequelize.transaction(); // Inicia una transacción
    try {
      const userNew = await AuthRepository.register(req.body, t);

      const baseUrl = "http://127.0.0.1:8003/api/"; // Cambia esto por tu dominio o URL base
      const userId = userNew.id; // Asegúrate de tener el ID del usuario disponible
      const verificationLink = `${baseUrl}verify-email/${userId}`;

      const emailResult = await sendEmail({
        to: req.body.email,
        subject: "Bienvenido a nuestra aplicación",
        text: `Hola ${req.body.name}, gracias por unirte. Verifica tu correo aquí: ${verificationLink}`,
        html: `
    <p>Hola <b>${req.body.name}</b>,</p>
    <p>Gracias por unirte a nuestra aplicación.</p>
    <p>Por favor verifica tu correo haciendo clic en el enlace a continuación:</p>
    <a href="${verificationLink}">Verificar mi correo</a>
    <p>Si no reconoces esta solicitud, puedes ignorar este mensaje.</p>
  `,
      });

      // Hacer commit de la transacción
      await t.commit();
      // Respuesta en formato JSON
      res.send("Correo enviado exitosamente.");
    } catch (error) {
      // Revertir la transacción en caso de error
      if (!t.finished) {
        await t.rollback();
      }
      // Verificar si el error está relacionado con el envío del correo
      if (error.code === "EAUTH" || error.response.includes("535-5.7.8")) {
        // Error específico de autenticación en el envío del correo
        logger.error("Error al enviar el correo: " + error.response);
        return res.status(422).json({
          error: "CorreoNoEnviado",
          details:
            "No se pudo enviar el correo debido a un problema con la autenticación o los datos del correo.",
          response: error.response, // O la respuesta completa para más detalles
        });
      }
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";

      logger.error("Error al registrar usuario: " + errorMsg);
      return res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async verifyEmail(req, res) {
    try {
      const userId = req.params.id;

      // Busca al usuario por ID
      const user = await AuthRepository.findById(userId); // Ajusta esto según tu ORM o lógica de búsqueda
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      // Actualiza el campo email_verified_at
      user.email_verified_at = new Date();
      await user.save();

      return res.send("Correo verificado exitosamente.");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error al verificar el correo.");
    }
  },

  //login
  async login(req, res) {
    logger.info("Entrando a loguearse");

    try {
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: req.body.email }, // Puede ser el correo
            { name: req.body.email }, // O puede ser el nombre de usuario
          ],
        },
        include: [
          {
            model: Person,
            as: "person",
          },
        ],
      });
      if (!user) {
        return res.status(204).json({ msg: "Usuario no encontrado" });
      }
      if (!user.email_verified_at) {
        return res.status(400).json({ msg: "Su cuenta no ha sido confimada" });
      }
      // Verificar si el campo password es nulo o vacío
      if (!user.password || user.password === "") {
        return res.status(400).json({ msg: "Credenciales inválidas" });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Credenciales inválidas" });
      }

      // Construimos el objeto del usuario con la estructura deseada
      const userNew = {
        id: user.id, // ID del usuario
        email: user.email, // Correo del usuario
        name: user.name,
        person: {
          id: user.person.id, // Aquí accedes a la persona creada
          name: user.person.name,
        },
      };

      // Creamos el token con el objeto estructurado
      const token = jwt.sign({ user: userNew }, authConfig.secret, {
        expiresIn: authConfig.expires, // Tiempo de expiración del token
      });
      // Decodificar el token para obtener la fecha de expiración
      const decoded = jwt.decode(token);

      // La fecha de expiración está en el campo 'exp' del JWT
      const expiresAt = new Date(decoded.exp * 1000); // 'exp' es en segundos, así que lo convertimos a milisegundos

      // Guardar el token en la base de datos
      await UserToken.create({
        user_id: user.id,
        token: token,
        expires_at: expiresAt,
      });

      // Respuesta exitosa
      res.status(201).json({
        id: user.id,
        userName: user.name,
        email: user.email,
        token: token,
        name: user.person.name,
        personId: user.person.id,
      });
    } catch (error) {
      const errorMsg = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message || "Error desconocido";

      logger.error("Error al loguear usuario: " + errorMsg);
      return res.status(500).json({ error: "ServerError", details: errorMsg });
    }
  },

  async logout(req, res) {
    logger.info(`${req.user.name} - Cierra sessión`);

    try {
      const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado Authorization

      if (!token) {
        return res.status(400).json({ msg: "No token proporcionado" });
      }

      // Marcar el token como revocado directamente en la base de datos
      const [updated] = await UserToken.update(
        { revoked: true },
        { where: { token }, returning: true }
      );

      if (updated === 0) {
        return res
          .status(400)
          .json({ msg: "Token no encontrado o ya revocado" });
      }

      // Responder al cliente
      res.status(200).json({ msg: "Logout exitoso" });
    } catch (err) {
      logger.error("Error al hacer logout: " + err.message);
      res.status(500).json({ error: "Error en el servidor" });
    }
  },

  async updatePassword(req, res) {
    logger.info(
      `${req.user.name} - Actualiza la contraseña del userID ${req.body.id}`
    );
    try {
      const { id, currentPassword, newPassword } = req.body;

      // Verificar que el usuario existe
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(400).json({ msg: "Usuario no encontrado" });
      }

      // Validar la contraseña actual para cuentas estándar
      const passwordMatch = bcrypt.compareSync(currentPassword, user.password);

      if (!passwordMatch) {
        return res
          .status(400)
          .json({ msg: "La contraseña actual no es correcta." });
      }

      // Encriptar la nueva contraseña
      const hashedNewPassword = bcrypt.hashSync(
        newPassword,
        Number.parseInt(authConfig.rounds)
      );

      // Actualizar la contraseña
      await user.update({ password: hashedNewPassword });

      res.status(200).json({ msg: "Contraseña actualizada correctamente." });
    } catch (err) {
      logger.error("Error al actualizar la contraseña: " + err.message);
      res.status(500).json({ error: "Error en el servidor" });
    }
  },
};

module.exports = AuthController;
