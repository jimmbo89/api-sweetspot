require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const logger = require("../../config/logger"); // Asegúrate de que este sea tu logger configurado

// Configuración de OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Función para enviar correos
async function sendEmail({ to, subject, text, html }) {
  try {
    // Obtener el token de acceso
    const accessToken = await oAuth2Client.getAccessToken();

    /*const transporter = nodemailer.createTransport({
      service: 'gmail', // Puedes usar otros proveedores como Yahoo, Outlook, etc.
      auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASSWORD, // La contraseña de tu correo (en caso de Gmail, puedes usar una contraseña de aplicación)
      },
    });*/

    // Crear el transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Configurar las opciones del correo
    const mailOptions = {
      from: `Remitente <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Enviar el correo
    //const result = await transporter.sendMail(mailOptions);
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error('Error al enviar el correo:', error);
          reject(error); // Rechazamos la promesa si hay un error
        } else {
          logger.info('Correo enviado:', info.response);
          resolve(info); // Resolvemos la promesa si todo fue exitoso
        }
      });
    });

  } catch (error) {
    logger.error("Error al enviar el correo:", error);
    throw error; // Propagar el error para que el controlador lo maneje
  }
}

module.exports = { sendEmail };
