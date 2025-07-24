const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Locker = sequelize.define('Locker', {
    identificador: { type: DataTypes.STRING, allowNull: false },
    ubicacion: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false },
    tipo: { type: DataTypes.ENUM('frios', 'perecederos', 'no_perecederos'), allowNull: false },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: 'lockers',
    timestamps: false,
});

module.exports = Locker;
