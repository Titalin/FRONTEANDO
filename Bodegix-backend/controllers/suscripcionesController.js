const Suscripcion = require('../models/Suscripcion');
const db = require('../config/db'); // conexión a MySQL

// ✅ GET /api/suscripciones
exports.getSuscripciones = async (req, res) => {
    try {
        const suscripciones = await Suscripcion.findAll({
            include: ['empresa', 'plan']
        });
        res.json(suscripciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET /api/suscripciones/:id
exports.getSuscripcionById = async (req, res) => {
    try {
        const { id } = req.params;
        const suscripcion = await Suscripcion.findByPk(id, {
            include: ['empresa', 'plan']
        });

        if (!suscripcion) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }

        res.json(suscripcion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ POST /api/suscripciones
exports.createSuscripcion = async (req, res) => {
    try {
        const { empresa_id, plan_id, fecha_inicio, fecha_fin, estado } = req.body;

        if (!empresa_id || !fecha_inicio || !fecha_fin || !estado) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const suscripcion = await Suscripcion.create({
            empresa_id,
            plan_id,
            fecha_inicio,
            fecha_fin,
            estado
        });

        res.status(201).json(suscripcion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ PUT /api/suscripciones/:id
exports.updateSuscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresa_id, plan_id, fecha_inicio, fecha_fin, estado } = req.body;

        const suscripcion = await Suscripcion.findByPk(id);
        if (!suscripcion) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }

        // Actualizar solo si hay campos
        if (empresa_id) suscripcion.empresa_id = empresa_id;
        if (plan_id) suscripcion.plan_id = plan_id;
        if (fecha_inicio) suscripcion.fecha_inicio = fecha_inicio;
        if (fecha_fin) suscripcion.fecha_fin = fecha_fin;
        if (estado) suscripcion.estado = estado;

        await suscripcion.save();
        res.json(suscripcion);
    } catch (error) {
        console.error('Error al actualizar suscripción:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE /api/suscripciones/:id
exports.deleteSuscripcion = async (req, res) => {
    try {
        const { id } = req.params;

        const suscripcion = await Suscripcion.findByPk(id);
        if (!suscripcion) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }

        await suscripcion.destroy();
        res.json({ message: 'Suscripción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/suscripciones/reporte
exports.getReporteSuscripciones = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    if (!mes || !anio) {
      return res.status(400).json({ error: 'Debe enviar mes y año' });
    }

    const [results] = await db.query(`
      SELECT 
        e.nombre AS empresa,
        p.nombre AS plan,
        CAST(p.costo AS DECIMAL(10,2)) AS costo,
        COUNT(s.id) AS total_suscripciones,
        CAST(SUM(p.costo) AS DECIMAL(10,2)) AS total_ingresos
      FROM suscripciones s
      JOIN empresas e ON s.empresa_id = e.id
      JOIN planes p ON s.plan_id = p.id
      WHERE MONTH(s.fecha_inicio) = ? AND YEAR(s.fecha_inicio) = ?
      GROUP BY e.nombre, p.nombre, p.costo
      ORDER BY total_ingresos DESC
    `, [mes, anio]);

    const parsedResults = results.map(row => ({
      ...row,
      costo: Number(row.costo),
      total_suscripciones: Number(row.total_suscripciones),
      total_ingresos: Number(row.total_ingresos)
    }));

    res.json(parsedResults);
  } catch (err) {
    console.error('Error al obtener el reporte:', err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
};
