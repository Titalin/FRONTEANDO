// routes/temperaturas.js
const express = require('express');
const Temperatura = require('../models/Temperatura');


function normalizeLockerId(id) {
  if (id == null) return id;
  const s = String(id).trim();
  return /^LOCKER_/i.test(s) ? s.toUpperCase() : `LOCKER_${s.padStart(3, '0')}`;
}

/* =========================
 *  A) API agrupada: /api/temperaturas/...
 * ========================= */
const api = express.Router();

// GET /api/temperaturas?locker_id=001|LOCKER_001&limit=50
api.get('/', async (req, res) => {
  try {
    const { locker_id } = req.query;
    let { limit = 50 } = req.query;

    // sanea limit
    limit = Number(limit);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 500); // hard cap

    const q = locker_id ? { locker_id: normalizeLockerId(locker_id) } : {};
    const data = await Temperatura.find(q, {
      // proyección: ajusta si quieres menos campos
      locker_id: 1, temperatura: 1, humedad: 1, peso: 1, timestamp: 1, created_at: 1,
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(data);
  } catch (err) {
    console.error('GET /api/temperaturas error:', err);
    res.status(500).json({ error: 'Error al obtener lecturas' });
  }
});

// GET /api/temperaturas/latest?locker_id=001|LOCKER_001
api.get('/latest', async (req, res) => {
  try {
    const { locker_id } = req.query;
    if (!locker_id) return res.status(400).json({ error: 'locker_id requerido' });

    const last = await Temperatura.findOne(
      { locker_id: normalizeLockerId(locker_id) },
      { locker_id: 1, temperatura: 1, humedad: 1, peso: 1, timestamp: 1, created_at: 1 }
    )
      .sort({ timestamp: -1, created_at: -1 })
      .lean();

    res.json(last || null);
  } catch (err) {
    console.error('GET /api/temperaturas/latest error:', err);
    res.status(500).json({ error: 'Error al obtener última lectura' });
  }
});

// GET /api/temperaturas/latest-all
api.get('/latest-all', async (_req, res) => {
  try {
    const data = await Temperatura.aggregate([
      { $sort: { timestamp: -1, created_at: -1 } },
      { $group: { _id: '$locker_id', doc: { $first: '$$ROOT' } } },
      { $replaceWith: '$doc' },
      { $project: { locker_id: 1, temperatura: 1, humedad: 1, peso: 1, timestamp: 1, created_at: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error('GET /api/temperaturas/latest-all error:', err);
    res.status(500).json({ error: 'Error al obtener últimas lecturas' });
  }
});

/* =========================
 *  B) Compat móvil: /api/temperatura/...
 *     (tu app espera un ARRAY con 1 elemento)
 * ========================= */
const compat = express.Router();

// GET /api/temperatura/:lockerId  ->  [ { ... } ]
compat.get('/temperatura/:lockerId', async (req, res) => {
  try {
    const lockerId = normalizeLockerId(req.params.lockerId);
    const doc = await Temperatura.findOne(
      { locker_id: lockerId },
      { temperatura: 1, humedad: 1, peso: 1, timestamp: 1 }
    )
      .sort({ timestamp: -1, created_at: -1 })
      .lean();

    if (!doc) return res.json([]);
    res.json([{
      temperatura: doc.temperatura,
      humedad: doc.humedad,
      peso: doc.peso ?? null,
      timestamp: doc.timestamp
    }]);
  } catch (err) {
    console.error('GET /api/temperatura/:lockerId error:', err);
    res.status(500).json({ error: 'Error al obtener última lectura' });
  }
});

// POST /api/temperatura  -> ingesta IoT
compat.post('/temperatura', async (req, res) => {
  try {
    let { locker_id, temperatura, humedad, peso, timestamp } = req.body;
    if (!locker_id || temperatura == null || humedad == null) {
      return res.status(400).json({ error: 'locker_id, temperatura y humedad son requeridos' });
    }

    const doc = await Temperatura.create({
      locker_id: normalizeLockerId(locker_id),
      temperatura,
      humedad,
      peso: (peso == null ? 0 : peso),
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json(doc);
  } catch (err) {
    // Si falla validación de Atlas, esto ayuda a ver el detalle en consola
    if (err?.errInfo?.details) {
      console.error('VALIDATION DETAILS:', JSON.stringify(err.errInfo.details, null, 2));
    }
    console.error('POST /api/temperatura error:', err);
    res.status(500).json({ error: 'Error al guardar lectura' });
  }
});

module.exports = { api, compat };
