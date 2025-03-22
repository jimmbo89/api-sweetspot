
const express = require('express');
const app = express();
const session = require('express-session');
const { sequelize } = require('./models/index');
const cors = require('cors');
//const passport = require('passport');

// Configuración de sesión
app.use(session({
  secret: 'bulletin',
  resave: false,
  saveUninitialized: true
}));
//settings
const PORT = process.env.PORT || 8000;

// Lista de orígenes permitidos
const allowedOrigins = ['http://api.dulceria.risoftwar.com', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (por ejemplo, desde aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);

    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El origen de la solicitud no está permitido.';
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  // Configura el origen adecuado para el frontend
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true // Permitir credenciales (cookies, tokens, etc.)
}));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/api', require('./routes'));

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}!`);
  sequelize.authenticate().then(() => {
    console.log('Nos hemos conectado a la base de datos!!!!');
  })
});