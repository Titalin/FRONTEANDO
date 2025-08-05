// routes/alertasRoutes.js
const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const auth = require('../middlewares/authMiddleware');

// GET /api/alertas/usuario/:id
router.get('/usuario/:id', auth, alertasController.getAlertasPorUsuario);

module.exports = router;
