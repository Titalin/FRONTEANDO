// controllers/lockersController.js

const Locker = require('../models/Locker');
const { Usuario } = require('../models');

// Obtener todos los lockers (incluyendo la empresa asociada)
exports.getLockers = async (req, res) => {
    try {
        const lockers = await Locker.findAll({ include: ['empresa'] });
        res.json(lockers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo locker
exports.createLocker = async (req, res) => {
    try {
        const { identificador, ubicacion, estado, tipo, empresa_id } = req.body;
        const locker = await Locker.create({ identificador, ubicacion, estado, tipo, empresa_id });
        res.status(201).json(locker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un locker existente
exports.updateLocker = async (req, res) => {
    try {
        const { id } = req.params;
        const { identificador, ubicacion, estado, tipo, empresa_id, usuario_id } = req.body;
        const [updated] = await Locker.update(
            { identificador, ubicacion, estado, tipo, empresa_id, usuario_id },
            { where: { id } }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Locker no encontrado' });
        }
        const updatedLocker = await Locker.findByPk(id);
        res.json(updatedLocker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Eliminar un locker
exports.deleteLocker = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Locker.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ error: 'Locker no encontrado' });
        }
        res.json({ message: 'Locker eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener lockers asociados a un usuario por ID de usuario
exports.getLockersPorUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const lockers = await Locker.findAll({
            where: { empresa_id: usuario.empresa_id },
            include: ['empresa'],
        });

        res.json(lockers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener locker por ID
exports.getLockerById = async (req, res) => {
    try {
        const locker = await Locker.findByPk(req.params.id);
        if (!locker) {
            return res.status(404).json({ error: 'Locker no encontrado' });
        }
        res.json(locker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLockersPorEmpresa = async (req, res) => {
    try {
        const { empresa_id } = req.params;

        const lockers = await Locker.findAll({
            where: { empresa_id },
            include: ['empresa']
        });

        res.json(lockers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
