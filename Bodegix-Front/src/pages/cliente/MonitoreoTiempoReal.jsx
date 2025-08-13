import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ScaleIcon from '@mui/icons-material/Scale';
import SensorsIcon from '@mui/icons-material/Sensors';

// Puedes configurar esto con REACT_APP_API_URL si quieres
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MonitoreoTiempoReal = () => {
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchLecturas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/temperaturas/latest-all`);
      const data = await res.json();
      setLecturas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener lecturas:', err);
      setLecturas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchLecturas();
    const id = setInterval(fetchLecturas, 5000); // cada 5s
    return () => clearInterval(id);
  }, []);

  const lecturasOrdenadas = useMemo(() => {
    // Ordena por locker_id ascendente: "001", "002", ...
    return [...lecturas].sort((a, b) => (a.locker_id || '').localeCompare(b.locker_id || ''));
  }, [lecturas]);

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Monitoreo en Tiempo Real" />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Estado de Lockers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Última lectura por locker desde MongoDB (colección <b>temperaturas</b>).
          </Typography>
        </Paper>

        {cargando ? (
          <Typography>Cargando…</Typography>
        ) : lecturasOrdenadas.length === 0 ? (
          <Typography>No hay lecturas disponibles.</Typography>
        ) : (
          <Grid container spacing={3}>
            {lecturasOrdenadas.map((t) => {
              const temp = t?.temperatura ?? '--';
              const hum = t?.humedad ?? '--';
              const peso = t?.peso ?? '--';
              const locker = t?.locker_id ?? 'N/A';
              // Si luego tienes un campo real de ocupación, reemplaza este false:
              const ocupado = false;

              return (
                <Grid item xs={12} sm={6} md={3} key={`${locker}-${t._id}`}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Locker {locker}
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      <Box>
                        <ThermostatIcon fontSize="large" color="error" />
                        <Typography variant="subtitle2">Temperatura</Typography>
                        <Typography>{temp} °C</Typography>
                      </Box>

                      <Box>
                        <WaterDropIcon fontSize="large" color="primary" />
                        <Typography variant="subtitle2">Humedad</Typography>
                        <Typography>{hum} %</Typography>
                      </Box>

                      <Box>
                        <ScaleIcon fontSize="large" />
                        <Typography variant="subtitle2">Peso</Typography>
                        <Typography>{peso}</Typography>
                      </Box>

                      <Box>
                        <SensorsIcon fontSize="large" color={ocupado ? 'error' : 'success'} />
                        <Typography variant="subtitle2">Ocupación</Typography>
                        <Chip
                          label={ocupado ? 'Ocupado' : 'Libre'}
                          color={ocupado ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        {t?.timestamp || t?.created_at
                          ? new Date(t.timestamp || t.created_at).toLocaleString()
                          : ''}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MonitoreoTiempoReal;
