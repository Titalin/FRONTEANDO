import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  People as PeopleIcon,
  Lock as LockersIcon,
  Assignment as AssignmentIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import { jwtDecode } from 'jwt-decode';

const DashboardCliente = () => {
  const [lockers, setLockers] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;

useEffect(() => {
  const fetchData = async () => {
    if (!token || !decoded?.empresa_id) {
      setLoading(false);
      return;
    }

    try {
      const resLockers = await fetch(`/api/lockers?empresa_id=${decoded.empresa_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const lockersData = await resLockers.json();
      console.log('Lockers:', lockersData);

      if (Array.isArray(lockersData)) {
        setLockers(lockersData);
      } else {
        console.error('Respuesta inválida de lockers:', lockersData);
        setLockers([]);
      }

      const resEmpleados = await fetch('/api/usuarios/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const empleadosData = await resEmpleados.json();
      console.log('Empleados:', empleadosData);

      if (Array.isArray(empleadosData)) {
        setEmpleados(empleadosData);
      } else {
        console.error('Respuesta inválida de empleados:', empleadosData);
        setEmpleados([]);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setLockers([]);
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [token, decoded]);


  const totalLockers = lockers.length;
  const asignados = lockers.filter(l => l.estado === 'activo').length;
  const disponibles = lockers.filter(l => l.estado === 'inactivo').length;
  const totalEmpleados = empleados.length;

  const stats = [
    { title: 'Lockers', value: totalLockers, icon: <LockersIcon fontSize="large" /> },
    { title: 'Asignados', value: asignados, icon: <AssignmentIcon fontSize="large" /> },
    { title: 'Disponibles', value: disponibles, icon: <StorageIcon fontSize="large" /> },
    { title: 'Empleados', value: totalEmpleados, icon: <PeopleIcon fontSize="large" /> },
  ];

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Dashboard" />
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <Grid container spacing={3} mt={2}>
            {stats.map((stat, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: index % 2 === 0 ? 'primary.light' : 'secondary.light',
                }}
              >
                <Box color="primary.main" mb={2}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1">{stat.title}</Typography>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DashboardCliente;
