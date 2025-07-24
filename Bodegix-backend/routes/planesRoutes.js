const express = require('express');
const router = express.Router();
const planesController = require('../controllers/planesController'); // ✅ AHORA COINCIDE
const auth = require('../middlewares/authMiddleware');

// CRUD protegido con auth
router.get('/', auth, planesController.getPlanes);
router.get('/:id', auth, planesController.getPlanById);
router.post('/', auth, planesController.createPlan);
router.put('/:id', auth, planesController.updatePlan);
router.delete('/:id', auth, planesController.deletePlan);

module.exports = router;
