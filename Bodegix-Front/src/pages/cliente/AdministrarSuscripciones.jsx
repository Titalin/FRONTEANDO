import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip, Divider } from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';

const planes = [
  { nombre: 'Basico', limite_usuarios: 5, costo: '$9.99/mes', tipo_pago: 'Mensual' },
  { nombre: 'Premium', limite_usuarios: 15, costo: '$19.99/mes', tipo_pago: 'Mensual' },
  { nombre: 'VIP', limite_usuarios: 30, costo: '$29.99/mes', tipo_pago: 'Mensual' },
];

const AdministrarSuscripciones = () => {
  const [planActual, setPlanActual] = useState('Premium');

  const cambiarPlan = (direccion) => {
    const indexActual = planes.findIndex((p) => p.nombre === planActual);
    const nuevoIndex = indexActual + direccion;
    if (nuevoIndex >= 0 && nuevoIndex < planes.length) {
      setPlanActual(planes[nuevoIndex].nombre);
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Gestión de Suscripciones" />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Plan Actual: {planActual}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Puedes cambiar tu plan de suscripción según tus necesidades y métodos de pago preferidos.
          </Typography>
          <Box display="flex" gap={2} my={2}>
            <Button
              variant="contained"
              color="secondary"
              disabled={planActual === 'Basico'}
              onClick={() => cambiarPlan(-1)}
            >
              Degradar Plan
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={planActual === 'VIP'}
              onClick={() => cambiarPlan(1)}
            >
              Subir Plan
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {planes.map((plan, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ border: plan.nombre === planActual ? '2px solid #1976d2' : 'none', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {plan.nombre}
                    </Typography>
                    <Chip label={plan.tipo_pago} color="info" size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Límite de usuarios: {plan.limite_usuarios}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Costo: {plan.costo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de pago: {plan.tipo_pago}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdministrarSuscripciones;
