const Plan = require('../models/Plan');

// ✅ GET /api/planes
exports.getPlanes = async (req, res) => {
    try {
        const planes = await Plan.findAll();
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET /api/planes/:id
exports.getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByPk(id);

        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ POST /api/planes
exports.createPlan = async (req, res) => {
    try {
        const { nombre, limite_usuarios, costo } = req.body;

        if (!nombre || !limite_usuarios || !costo) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const planExistente = await Plan.findOne({ where: { nombre } });
        if (planExistente) {
            return res.status(409).json({ error: 'El plan ya está registrado' });
        }

        const plan = await Plan.create({ nombre, limite_usuarios, costo });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ PUT /api/planes/:id
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, limite_usuarios, costo } = req.body;

        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        if (nombre) plan.nombre = nombre;
        if (limite_usuarios) plan.limite_usuarios = limite_usuarios;
        if (costo) plan.costo = costo;

        await plan.save();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE /api/planes/:id
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        await plan.destroy();
        res.json({ message: 'Plan eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
