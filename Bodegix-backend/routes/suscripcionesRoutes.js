const express = require('express');
const router = express.Router();
const suscripcionesController = require('../controllers/suscripcionesController');
const auth = require('../middlewares/authMiddleware'); // Protege con auth

// 📌 Primero el endpoint de reporte (antes de /:id)
// Quita el auth si quieres probar sin token
router.get('/reporte', suscripcionesController.getReporteSuscripciones);

// ✅ GET todas las suscripciones
router.get('/', auth, suscripcionesController.getSuscripciones);

// ✅ GET suscripción por ID
router.get('/:id', auth, suscripcionesController.getSuscripcionById);

// ✅ POST crear suscripción
router.post('/', auth, suscripcionesController.createSuscripcion);

// ✅ PUT actualizar suscripción
router.put('/:id', auth, suscripcionesController.updateSuscripcion);

// ✅ DELETE eliminar suscripción
router.delete('/:id', auth, suscripcionesController.deleteSuscripcion);

module.exports = router;
