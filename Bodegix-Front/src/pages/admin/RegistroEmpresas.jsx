import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Grid, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer
} from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';

// Clave normalizada por STRING para evitar problemas de tipos (número vs string vs UUID)
const toKey = (v) => {
  if (v === null || v === undefined) return null;
  // Limpia espacios y convierte todo a string estable
  const s = String(v).trim();
  return s.length ? s : null;
};

// --- Normalizadores --- //
const normalizeEmpresa = (e) => {
  // Busca el id en múltiples variantes y vuelve clave string
  const key =
    toKey(e?.id) ??
    toKey(e?.empresa_id) ??
    toKey(e?.id_empresa) ??
    toKey(e?.company_id) ??
    toKey(e?.empresaId) ??
    toKey(e?.empresa?.id);

  return {
    ...e,
    __key: key, // clave interna para matching
    id: e?.id ?? e?.empresa_id ?? e?.id_empresa ?? e?.empresa?.id ?? key, // preserva lo que tengas
    nombre: e?.nombre ?? e?.name ?? e?.razon_social ?? e?.razonSocial ?? '',
    telefono: e?.telefono ?? e?.phone ?? '',
    direccion: e?.direccion ?? e?.address ?? '',
  };
};

const normalizeUsuario = (u) => {
  const empKey =
    toKey(u?.empresa_id) ??
    toKey(u?.empresaId) ??
    toKey(u?.company_id) ??
    toKey(u?.id_empresa) ??
    toKey(u?.empresa?.id) ??
    toKey(u?.company?.id);

  // rol_id robusto
  let rol_id =
    u?.rol_id ?? u?.role_id ?? u?.rol ?? u?.role ?? u?.rol?.id ?? u?.role?.id;

  if (rol_id === undefined || rol_id === null || rol_id === '') {
    const roleName = String(
      u?.rol_nombre ??
      u?.role_name ??
      u?.rol?.nombre ??
      u?.role?.name ??
      u?.roleName ??
      u?.rolName ??
      ''
    ).toLowerCase();
    if (roleName.includes('admin')) rol_id = 2;
    if (roleName.includes('emple')) rol_id = 3;
  }

  // Asegura número si es numérico, si no déjalo como string (lo comparamos con Number más abajo)
  const nRol = Number(rol_id);
  const rol = Number.isNaN(nRol) ? rol_id : nRol;

  return { ...u, __empKey: empKey, rol_id: rol };
};

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
        fetch('/api/usuarios/admin', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const empresasDataRaw = await empRes.json();
      const usuariosDataRaw = await usrRes.json();

      const empresasFuente = Array.isArray(empresasDataRaw)
        ? empresasDataRaw
        : empresasDataRaw?.data ?? empresasDataRaw?.empresas ?? empresasDataRaw?.items ?? [];

      const usuariosFuente = Array.isArray(usuariosDataRaw)
        ? usuariosDataRaw
        : usuariosDataRaw?.data ?? usuariosDataRaw?.usuarios ?? usuariosDataRaw?.items ?? [];

      const empresasNormalizadas = empresasFuente.map(normalizeEmpresa);
      const usuariosNormalizados = usuariosFuente.map(normalizeUsuario);

      // DEBUG opcional en consola para ver exactamente qué llega
      console.table(empresasNormalizadas.map(e => ({ __key: e.__key, id: e.id, nombre: e.nombre })));
      console.table(usuariosNormalizados.map(u => ({ __empKey: u.__empKey, rol_id: u.rol_id })));

      setEmpresas(empresasNormalizadas);
      setUsuarios(usuariosNormalizados);
    } catch (err) {
      console.error('Error al obtener empresas o usuarios:', err);
    }
  };

  useEffect(() => {
    fetchEmpresasYUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Conteo por clave string
  const conteosPorKey = useMemo(() => {
    const map = new Map(); // empKey -> { empleados, admins }
    for (const u of usuarios) {
      const key = u?.__empKey;
      if (!key) continue;

      // fuerza rol a número si es posible
      const nRol = Number(u?.rol_id);
      const rol = Number.isNaN(nRol) ? u?.rol_id : nRol;

      if (!map.has(key)) map.set(key, { empleados: 0, admins: 0 });
      if (rol === 3 || String(rol) === '3') map.get(key).empleados++;
      if (rol === 2 || String(rol) === '2') map.get(key).admins++;
    }
    return map;
  }, [usuarios]);

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
    setFormEmpresa({
      nombre: empresa?.nombre || '',
      telefono: empresa?.telefono || '',
      direccion: empresa?.direccion || ''
    });
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
          // usa el id visible; el backend sabrá guardarlo como corresponda
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
                {empresas.map((empresa) => {
                  const key = empresa.__key ?? toKey(empresa?.id);
                  const counts = (key && conteosPorKey.get(key)) || { empleados: 0, admins: 0 };
                  return (
                    <TableRow key={empresa.id ?? `${empresa.nombre}-${key}`}>
                      <TableCell>{empresa.nombre}</TableCell>
                      <TableCell>{empresa.telefono || 'N/A'}</TableCell>
                      <TableCell>{empresa.direccion || 'N/A'}</TableCell>
                      <TableCell>{counts.empleados}</TableCell>
                      <TableCell>{counts.admins}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => handleSeleccionEmpresa(empresa)}>
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegistroEmpresas;
