const express = require('express');
const router = express.Router();
const lockersController = require('../controllers/lockersController');
const auth = require('../middlewares/authMiddleware');

// Todas las rutas usan middleware de autenticación (auth)

router.get('/', auth, lockersController.getLockers);

router.post('/', auth, lockersController.createLocker);

router.put('/:id', auth, lockersController.updateLocker);

router.delete('/:id', auth, lockersController.deleteLocker);

// Obtener lockers por empresa
router.get('/empresa/:empresa_id', auth, lockersController.getLockersPorEmpresa);

// Obtener lockers por usuario
router.get('/usuario/:id', auth, lockersController.getLockersPorUsuario);


module.exports = router;
