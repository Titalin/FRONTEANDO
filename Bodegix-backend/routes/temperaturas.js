const express = require('express');
const Temperatura = require('../models/Temperatura');
const router = express.Router();

// GET /api/temperaturas?locker_id=001&limit=50
router.get('/', async (req, res) => {
  try {
    const { locker_id, limit = 50 } = req.query;
    const query = locker_id ? { locker_id } : {};
    const data = await Temperatura.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener lecturas' });
  }
});

// GET /api/temperaturas/latest?locker_id=001
router.get('/latest', async (req, res) => {
  try {
    const { locker_id } = req.query;
    if (!locker_id) return res.status(400).json({ error: 'locker_id requerido' });
    const last = await Temperatura.findOne({ locker_id })
      .sort({ timestamp: -1, created_at: -1 });
    res.json(last || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener última lectura' });
  }
});

// GET /api/temperaturas/latest-all
router.get('/latest-all', async (_req, res) => {
  try {
    const data = await Temperatura.aggregate([
      { $sort: { timestamp: -1, created_at: -1 } },
      { $group: { _id: '$locker_id', doc: { $first: '$$ROOT' } } },
      { $replaceWith: '$doc' },
      { $project: { _id: 1, locker_id: 1, temperatura: 1, humedad: 1, peso: 1, timestamp: 1, created_at: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener últimas lecturas' });
  }
});

module.exports = router;
