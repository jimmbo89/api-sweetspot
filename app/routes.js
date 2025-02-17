const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); // Importación compatible con CommonJS

//Controladores
const AuthController = require('./controllers/AuthController');
const RoleController = require('./controllers/RoleController');
const BusinessController = require('./controllers/BusinessController');
const BusinessPersonController = require('./controllers/BusinessPersonController');
const DeepSeekController = require('./controllers/DeepSeekController');
const PersonController = require('./controllers/PersonController');
const WarehouseController = require('./controllers/WareHouseController');

//Middlewares
const auth = require('./middlewares/auth');
const multerImage = require('./middlewares/multerImage');
const validateSchema = require('./middlewares/validateSchema');
const { registerSchema, loginSchema, updatePasswordSchema } = require('./middlewares/validations/authValidation');
const { storeRoleSchema, updateRoleSchema, idRoleSchema, typeRoleSchema } = require('./middlewares/validations/roleValidation');
const { storeBusinessSchema, updateBusinessSchema, idBusinessSchema } = require('./middlewares/validations/businessValidation');
const { storeBusinessPersonSchema, updateBusinessPersonSchema, idBusinessPersonSchema } = require('./middlewares/validations/businesspersonValidation');
const { storePersonSchema, updatePersonSchema, idPersonSchema, idBusinessIdSchema } = require('./middlewares/validations/personValidation');
const { filterWarehouseSchema, idWarehouseSchema, storeWarehouseSchema, updateWarehouseSchema } = require('./middlewares/validations/warehouseValidation');


router.get('/', (req, res) => res.json({ hello: "World" }));


router.post('/register', validateSchema(registerSchema), AuthController.register);
router.post('/login', validateSchema(loginSchema), AuthController.login);
router.get('/verify-email/:id', AuthController.verifyEmail);

router.post('/chat', DeepSeekController.handleChat);
// Ruta para servir imágenes desde la carpeta `public`
router.get('/images/:foldername/:filename', (req, res) => {
    const { foldername, filename } = req.params;
    const imagePath = path.join(__dirname, '../public', foldername, filename);

    // Verifica si el archivo existe
    if (!fs.existsSync(imagePath)) {
        return res.status(400).send('Imagen no encontrada');
    }

    // Obtén el tipo MIME del archivo
    const fileType = mime.lookup(imagePath) || 'application/octet-stream';

    // Lee el archivo y envíalo en la respuesta
    fs.readFile(imagePath, (err, file) => {
        if (err) {
            return res.status(500).send('Error al leer la imagen');
        }
        res.writeHead(200, { 'Content-Type': fileType });
        res.end(file);
    });
});
//rutas protegidas 
router.use(auth);
router.get('/logout', AuthController.logout);
router.post('/update-password', validateSchema(updatePasswordSchema), AuthController.updatePassword);


//Rutas Roles
router.get('/role', RoleController.index);
router.post('/role', validateSchema(storeRoleSchema), RoleController.store);
router.post('/role-show', validateSchema(idRoleSchema), RoleController.show);
router.put('/role', validateSchema(updateRoleSchema), RoleController.update);
router.post('/role-destroy', validateSchema(idRoleSchema), RoleController.destroy);
router.post('/get-role-type', validateSchema(typeRoleSchema), RoleController.getRolesByType);

//Rutas Business
router.get('/business', BusinessController.index);
router.post('/business', multerImage('image', 'businesses'), validateSchema(storeBusinessSchema), BusinessController.store);
router.post('/business-show', validateSchema(idBusinessSchema), BusinessController.show);
router.post('/business-update', multerImage('image', 'businesses'), validateSchema(updateBusinessSchema), BusinessController.update);
router.post('/business-destroy', validateSchema(idBusinessSchema), BusinessController.destroy);

//Rutas Business
router.get('/business-person', BusinessPersonController.index);
router.post('/business-person', validateSchema(storeBusinessPersonSchema), BusinessPersonController.store);
router.post('/business-person-show', validateSchema(idBusinessPersonSchema), BusinessPersonController.show);
router.put('/business-person', validateSchema(updateBusinessPersonSchema), BusinessPersonController.update);
router.post('/business-destroy', validateSchema(idBusinessPersonSchema), BusinessPersonController.destroy);

router.post('/person-index', validateSchema(idBusinessIdSchema), PersonController.index);
router.post('/person', multerImage('image', 'people'), validateSchema(storePersonSchema), PersonController.store);
router.post('/person-show', validateSchema(idPersonSchema), PersonController.show);
router.post('/person-update', multerImage('image', 'people'), validateSchema(updatePersonSchema), PersonController.update);
router.post('/person-destroy', validateSchema(idPersonSchema), PersonController.destroy);

router.get('/warehouse', WarehouseController.index);
router.post('/warehouse-cursor',validateSchema(filterWarehouseSchema),  WarehouseController.businessWarehouses);
router.post('/warehouse', multerImage('image', 'warehouses'), validateSchema(storeWarehouseSchema), WarehouseController.store);
router.post('/warehouse-show', validateSchema(idWarehouseSchema), WarehouseController.show);
router.post('/warehouse-update', multerImage('image', 'warehouses'), validateSchema(updateWarehouseSchema), WarehouseController.update);
router.post('/warehouse-destroy', validateSchema(idWarehouseSchema), WarehouseController.destroy);



module.exports = router;