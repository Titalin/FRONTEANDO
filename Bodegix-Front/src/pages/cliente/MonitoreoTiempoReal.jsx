import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ScaleIcon from '@mui/icons-material/Scale';
import SensorsIcon from '@mui/icons-material/Sensors';

const MonitoreoTiempoReal = () => {
  const [datos, setDatos] = useState({
    temperatura: '--',
    humedad: '--',
    peso: '--',
    ocupado: false,
  });

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Cambia la URL según sea necesario
        const res = await fetch('http://localhost:8000/temperatura/LOCKER_002');
        const data = await res.json();

        // Usar el dato más reciente (primer elemento del array)
        const actual = Array.isArray(data) && data.length > 0 ? data[0] : null;

        setDatos({
          temperatura: actual ? actual.temperatura : '--',
          humedad: actual ? actual.humedad : '--',
          peso: '--',      // Agrega lógica si tienes este dato en tu API
          ocupado: false,  // Agrega lógica si tienes este dato en tu API
        });
      } catch (error) {
        console.error('Error al obtener datos del locker:', error);
      }
    };

    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Monitoreo en Tiempo Real" />
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Estado del Locker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta en tiempo real los datos del locker asignado.
          </Typography>
        </Paper>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <ThermostatIcon fontSize="large" color="error" />
              <Typography variant="h6">Temperatura</Typography>
              <Typography>{datos.temperatura} °C</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <WaterDropIcon fontSize="large" color="primary" />
              <Typography variant="h6">Humedad</Typography>
              <Typography>{datos.humedad} %</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <SensorsIcon fontSize="large" color={datos.ocupado ? 'error' : 'success'} />
              <Typography variant="h6">Ocupación</Typography>
              <Chip label={datos.ocupado ? 'Ocupado' : 'Libre'} color={datos.ocupado ? 'error' : 'success'} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MonitoreoTiempoReal;
