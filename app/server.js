
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

app.use(cors({
  //origin: 'http://localhost:8080',  // Asegúrate de permitir tu dominio frontend
  allowedHeaders: ['Authorization', 'Content-Type'],  // Asegúrate de que 'Authorization' esté permitido
})); // Habilita CORS para todos los orígenes

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