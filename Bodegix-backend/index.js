// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models/index');

const planesRoutes = require('./routes/planesRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const lockersRoutes = require('./routes/lockersRoutes');
const accesosRoutes = require('./routes/accesosRoutes');
const suscripcionesRoutes = require('./routes/suscripcionesRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const loginMovilRoutes = require('./routes/loginMovilRoute');
<<<<<<< HEAD
const paypalRoutes = require('./routes/paypalRoutes'); // aquí la importación
=======
const reportsRoutes = require('./routes/reportsRoutes'); // Importar rutas
>>>>>>> 8853c58bc2284cec79507bfa1c33a140a06b69e8

const app = express(); // ahora primero creamos app
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use('/api/planes', planesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/lockers', lockersRoutes);
app.use('/api/accesos', accesosRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/movil', loginMovilRoutes);
<<<<<<< HEAD
app.use('/api/paypal', paypalRoutes); // ahora sí lo usamos aquí

// Conexión a base de datos y arranque de servidor
=======
app.use('/api/reports', reportsRoutes);// Registrar la nueva ruta

// Conexión y arranque
>>>>>>> 8853c58bc2284cec79507bfa1c33a140a06b69e8
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: false })
  .then(() => {
    console.log(' Base de datos conectada y sincronizada');
    app.listen(PORT, () => {
      console.log(` Bodegix backend corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(' Error al conectar con la base de datos:', error);
  });
