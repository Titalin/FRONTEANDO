import React, { useEffect, useState, useCallback } from 'react';
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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const getStatusIcon = (estado) => {
  if (estado === 'activa') return <CheckCircleIcon color="success" fontSize="large" />;
  if (estado === 'inactiva') return <HighlightOffIcon color="error" fontSize="large" />;
  return <WarningIcon color="warning" fontSize="large" />;
};

const VisualizacionGraficas = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const token = localStorage.getItem('token');

  const fetchDatos = useCallback(async () => {
    try {
      const [resEmpresas, resSuscripciones] = await Promise.all([
        fetch('/api/empresas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/suscripciones', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const empresasData = await resEmpresas.json();
      const suscripcionesData = await resSuscripciones.json();

      setEmpresas(empresasData);
      setSuscripciones(suscripcionesData);
    } catch (err) {
      console.error('Error al obtener empresas o suscripciones:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const ultimasSuscripcionesPorEmpresa = {};
  suscripciones.forEach((sub) => {
    const empresaId = sub.empresa?.id || sub.empresa_id;
    const fecha = new Date(sub.fecha_inicio);
    if (!ultimasSuscripcionesPorEmpresa[empresaId] || fecha > new Date(ultimasSuscripcionesPorEmpresa[empresaId].fecha_inicio)) {
      ultimasSuscripcionesPorEmpresa[empresaId] = sub;
    }
  });

  const ultimasSuscripciones = Object.values(ultimasSuscripcionesPorEmpresa);
  const empresasConSuscripcion = ultimasSuscripciones.map(sub => sub.empresa?.id || sub.empresa_id);
  const empresasSinSuscripcion = empresas.filter(e => !empresasConSuscripcion.includes(e.id));

  const historialEmpresas = {};
  suscripciones.forEach((sub) => {
    const mes = new Date(sub.fecha_inicio).toISOString().slice(0, 7); // YYYY-MM
    const empresaNombre = sub.empresa?.nombre || 'Desconocida';
    if (!historialEmpresas[mes]) historialEmpresas[mes] = {};
    historialEmpresas[mes][empresaNombre] = (historialEmpresas[mes][empresaNombre] || 0) + 1;
  });

  const dataGrafica = Object.entries(historialEmpresas).map(([mes, empresas]) => ({ mes, ...empresas }));
  const nombresEmpresas = Array.from(new Set(suscripciones.map(sub => sub.empresa?.nombre).filter(Boolean)));
  const colores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#d0ed57'];

  const handleEmpresaClick = (empresaId) => {
    const seleccionada = empresas.find(e => e.id === empresaId);
    setEmpresaSeleccionada(seleccionada);
  };

  const historialEmpresaSeleccionada = {};
  if (empresaSeleccionada) {
    suscripciones
      .filter(sub => (sub.empresa?.id || sub.empresa_id) === empresaSeleccionada.id)
      .forEach((sub) => {
        const mes = new Date(sub.fecha_inicio).toISOString().slice(0, 7);
        historialEmpresaSeleccionada[mes] = (historialEmpresaSeleccionada[mes] || 0) + 1;
      });
  }

  const dataEmpresaIndividual = Object.entries(historialEmpresaSeleccionada).map(([mes, total]) => ({ mes, Total: total }));

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Visualización de Gráficas" />

        <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
          <Typography variant="h5" gutterBottom>
            Estado de Suscripciones (Última actualización por empresa)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panel que muestra solo la última suscripción registrada de cada empresa.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {ultimasSuscripciones.map((sub) => (
            <Grid item xs={12} sm={6} md={4} key={`sub-${sub.id}`}>
              <Paper
                onClick={() => handleEmpresaClick(sub.empresa?.id || sub.empresa_id)}
                sx={{
                  cursor: 'pointer',
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
                <Chip label={sub.estado} color={sub.estado === 'activa' ? 'success' : sub.estado === 'inactiva' ? 'error' : 'warning'} sx={{ mb: 1 }} />
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
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

          {empresasSinSuscripcion.map((empresa) => (
            <Grid item xs={12} sm={6} md={4} key={`no-sub-${empresa.id}`}>
              <Paper
                onClick={() => handleEmpresaClick(empresa.id)}
                sx={{
                  cursor: 'pointer',
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
                <Chip label="Sin suscripción" color="default" sx={{ mb: 1 }} />
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

        {/* Gráfica mensual general */}
        <Paper sx={{ mt: 6, p: 3 }} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Historial mensual de suscripciones por empresa
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dataGrafica}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {nombresEmpresas.map((nombre, idx) => (
                <Line
                  key={nombre}
                  type="monotone"
                  dataKey={nombre}
                  stroke={colores[idx % colores.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Gráfica individual por mes */}
        {empresaSeleccionada && (
          <Paper sx={{ mt: 6, p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Historial mensual de suscripciones - {empresaSeleccionada.nombre}
            </Typography>
            {dataEmpresaIndividual.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataEmpresaIndividual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Total"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Esta empresa aún no tiene suscripciones registradas.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default VisualizacionGraficas;
