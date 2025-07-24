// src/pages/admin/VisualizacionGraficas.jsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Divider
} from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const getStatusIcon = (estado) => {
  if (estado === 'activa') return <CheckCircleIcon color="success" fontSize="large" />;
  if (estado === 'inactiva') return <HighlightOffIcon color="error" fontSize="large" />;
  return <WarningIcon color="warning" fontSize="large" />;
};

const VisualizacionGraficas = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  const token = localStorage.getItem('token');

  const fetchDatos = async () => {
    try {
      const [resEmpresas, resSuscripciones] = await Promise.all([
        fetch('/api/empresas', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/suscripciones', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const empresasData = await resEmpresas.json();
      const suscripcionesData = await resSuscripciones.json();

      setEmpresas(empresasData);
      setSuscripciones(suscripcionesData);
    } catch (err) {
      console.error('Error al obtener empresas o suscripciones:', err);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // Agrupar empresas con suscripciones activas/inactivas
  const empresasConSuscripcion = suscripciones.map(sub => sub.empresa?.id);
  const empresasSinSuscripcion = empresas.filter(e => !empresasConSuscripcion.includes(e.id));

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Visualización de Gráficas" />

        <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
          <Typography variant="h5" gutterBottom>
            Estado de Suscripciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panel combinado que muestra todas las empresas, sus suscripciones (si existen) y estados visuales.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Suscripciones existentes */}
          {suscripciones.map((sub) => (
            <Grid item xs={12} sm={6} md={4} key={`sub-${sub.id}`}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                {getStatusIcon(sub.estado)}
                <Typography variant="h6" mt={1} gutterBottom>
                  {sub.empresa?.nombre || 'Sin Empresa'}
                </Typography>
                <Chip
                  label={sub.estado}
                  color={
                    sub.estado === 'activa'
                      ? 'success'
                      : sub.estado === 'inactiva'
                      ? 'error'
                      : 'warning'
                  }
                  sx={{ mb: 1 }}
                />
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" gutterBottom>
                  <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Plan: {sub.plan?.nombre || 'Sin plan'}
                </Typography>
                <Typography variant="body2">
                  <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Inicio: {sub.fecha_inicio}
                </Typography>
                <Typography variant="body2">
                  <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Fin: {sub.fecha_fin}
                </Typography>
              </Paper>
            </Grid>
          ))}

          {/* Empresas sin suscripción */}
          {empresasSinSuscripcion.map((empresa) => (
            <Grid item xs={12} sm={6} md={4} key={`no-sub-${empresa.id}`}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <HighlightOffIcon color="disabled" fontSize="large" />
                <Typography variant="h6" mt={1} gutterBottom>
                  {empresa.nombre}
                </Typography>
                <Chip
                  label="Sin suscripción"
                  color="default"
                  sx={{ mb: 1 }}
                />
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Teléfono: {empresa.telefono || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Dirección: {empresa.direccion || 'N/A'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default VisualizacionGraficas;
