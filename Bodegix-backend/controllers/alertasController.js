// controllers/alertasController.js
const Locker = require('../models/Locker'); // Modelo MySQL
const Temperatura = require('../../bodegix_api/models/Temperatura');


exports.getAlertasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // 1. Buscar lockers asignados al usuario (MySQL)
    const lockers = await Locker.findAll({ where: { usuario_id: usuarioId } });

    let alertas = [];

    // 2. Recorrer cada locker y comparar valores
    for (const locker of lockers) {
      const lockerIdMongo = `LOCKER_${String(locker.identificador).padStart(3, '0')}`;

      // 3. Último registro en MongoDB
      const ultimoDato = await Temperatura.findOne({ locker_id: lockerIdMongo })
        .sort({ timestamp: -1 })
        .lean();

      if (ultimoDato) {
        // Comparar temperatura
        if (locker.temp_min != null && ultimoDato.temperatura < locker.temp_min) {
          alertas.push({
            tipo: 'temperatura',
            mensaje: `Locker ${locker.identificador}: temperatura baja (${ultimoDato.temperatura}°C)`
          });
        }
        if (locker.temp_max != null && ultimoDato.temperatura > locker.temp_max) {
          alertas.push({
            tipo: 'temperatura',
            mensaje: `Locker ${locker.identificador}: temperatura alta (${ultimoDato.temperatura}°C)`
          });
        }

        // Comparar humedad
        if (locker.hum_min != null && ultimoDato.humedad < locker.hum_min) {
          alertas.push({
            tipo: 'humedad',
            mensaje: `Locker ${locker.identificador}: humedad baja (${ultimoDato.humedad}%)`
          });
        }
        if (locker.hum_max != null && ultimoDato.humedad > locker.hum_max) {
          alertas.push({
            tipo: 'humedad',
            mensaje: `Locker ${locker.identificador}: humedad alta (${ultimoDato.humedad}%)`
          });
        }

        // Comparar peso
        if (locker.peso_max != null && ultimoDato.peso > locker.peso_max) {
          alertas.push({
            tipo: 'peso',
            mensaje: `Locker ${locker.identificador}: peso excedido (${ultimoDato.peso} kg)`
          });
        }
      }
    }

    res.json(alertas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
};
