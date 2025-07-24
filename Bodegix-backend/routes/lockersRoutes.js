const express = require('express');
const router = express.Router();
const lockersController = require('../controllers/lockersController');
const auth = require('../middlewares/authMiddleware');

// Todas las rutas usan middleware de autenticación (auth)

router.get('/', auth, lockersController.getLockers);

router.post('/', auth, lockersController.createLocker);

router.put('/:id', auth, lockersController.updateLocker);

router.delete('/:id', auth, lockersController.deleteLocker);

module.exports = router;
