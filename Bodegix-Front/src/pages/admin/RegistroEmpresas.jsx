import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Grid, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer
} from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';

const RegistroEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [formEmpresa, setFormEmpresa] = useState({ nombre: '', telefono: '', direccion: '' });
  const [formAdmin, setFormAdmin] = useState({ nombre: '', correo: '', contraseña: '' });

  const token = localStorage.getItem('token');

  const fetchEmpresasYUsuarios = async () => {
    try {
      const [empRes, usrRes] = await Promise.all([
        fetch('/api/empresas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/usuarios', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const empresasData = await empRes.json();
      const usuariosData = await usrRes.json();

      setEmpresas(empresasData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error('Error al obtener empresas o usuarios:', err);
    }
  };

  useEffect(() => {
    fetchEmpresasYUsuarios();
  }, []);

  const empleadosPorEmpresa = (empresaId) =>
    usuarios.filter((u) => u.empresa_id === empresaId && u.rol_id === 3).length;

  const adminsPorEmpresa = (empresaId) =>
    usuarios.filter((u) => u.empresa_id === empresaId && u.rol_id === 2).length;

  const handleEmpresaChange = (e) => {
    setFormEmpresa({ ...formEmpresa, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e) => {
    setFormAdmin({ ...formAdmin, [e.target.name]: e.target.value });
  };

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formEmpresa)
      });

      if (!res.ok) throw new Error('Error al registrar empresa');
      await fetchEmpresasYUsuarios();
      setFormEmpresa({ nombre: '', telefono: '', direccion: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeleccionEmpresa = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setFormEmpresa(empresa);
    setFormAdmin({ nombre: '', correo: '', contraseña: '' });
  };

  const handleActualizarEmpresa = async (e) => {
    e.preventDefault();
    if (!empresaSeleccionada) return;

    try {
      const res = await fetch(`/api/empresas/${empresaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formEmpresa)
      });

      if (!res.ok) throw new Error('Error al actualizar empresa');
      await fetchEmpresasYUsuarios();
      setEmpresaSeleccionada(null);
      setFormEmpresa({ nombre: '', telefono: '', direccion: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAgregarAdmin = async (e) => {
    e.preventDefault();
    if (!empresaSeleccionada) return;

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formAdmin,
          rol_id: 2, // Admin Empresa
          empresa_id: empresaSeleccionada.id
        })
      });

      if (!res.ok) throw new Error('Error al crear usuario admin empresa');
      await fetchEmpresasYUsuarios();
      setFormAdmin({ nombre: '', correo: '', contraseña: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Registro de Empresas y Administradores" />

        {/* Registro o edición de empresa */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {empresaSeleccionada ? 'Editar Empresa Seleccionada' : 'Registrar Nueva Empresa'}
          </Typography>
          <Box component="form" onSubmit={empresaSeleccionada ? handleActualizarEmpresa : handleEmpresaSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={formEmpresa.nombre}
                  onChange={handleEmpresaChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Teléfono"
                  name="telefono"
                  value={formEmpresa.telefono}
                  onChange={handleEmpresaChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Dirección"
                  name="direccion"
                  value={formEmpresa.direccion}
                  onChange={handleEmpresaChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} display="flex" gap={2}>
                <Button type="submit" variant="contained" color="primary">
                  {empresaSeleccionada ? 'Actualizar Empresa' : 'Registrar Empresa'}
                </Button>
                {empresaSeleccionada && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEmpresaSeleccionada(null);
                      setFormEmpresa({ nombre: '', telefono: '', direccion: '' });
                      setFormAdmin({ nombre: '', correo: '', contraseña: '' });
                    }}
                  >
                    Cancelar edición
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Registro de Admin Empresa */}
        {empresaSeleccionada && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Agregar Admin Empresa a {empresaSeleccionada.nombre}
            </Typography>
            <Box component="form" onSubmit={handleAgregarAdmin}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={formAdmin.nombre}
                    onChange={handleAdminChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Correo"
                    name="correo"
                    value={formAdmin.correo}
                    onChange={handleAdminChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Contraseña"
                    name="contraseña"
                    type="password"
                    value={formAdmin.contraseña}
                    onChange={handleAdminChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="secondary">
                    Agregar Admin Empresa
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Tabla de empresas */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Empresas Registradas
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Teléfono</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Dirección</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Empleados</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Admins</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>{empresa.nombre}</TableCell>
                    <TableCell>{empresa.telefono || 'N/A'}</TableCell>
                    <TableCell>{empresa.direccion || 'N/A'}</TableCell>
                    <TableCell>{empleadosPorEmpresa(empresa.id)}</TableCell>
                    <TableCell>{adminsPorEmpresa(empresa.id)}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleSeleccionEmpresa(empresa)}>
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegistroEmpresas;
