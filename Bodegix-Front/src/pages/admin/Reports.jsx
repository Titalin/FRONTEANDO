import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';

const Reports = () => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Reportes" />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Visualización de reportes generales del sistema</Typography>
          <Typography variant="body1" color="text.secondary">
            Esta sección está destinada a mostrar reportes de uso, actividad y métricas del sistema.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Reports;
