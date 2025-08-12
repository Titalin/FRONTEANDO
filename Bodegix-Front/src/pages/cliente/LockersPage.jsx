import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, FormControl, InputLabel, Stack, TextField, MenuItem, Select
} from '@mui/material';
import {
  Lock as LockerIcon,
  PowerSettingsNew as EstadoIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import { jwtDecode } from 'jwt-decode';

const API_URL = "http://localhost:5000";

const LockersPage = () => {
  const [lockers, setLockers] = useState([]);
  const [empleados, setEmpleados] = useState([]); // Solo rol_id 3 de la misma empresa
  const [token, setToken] = useState('');
  const [empresaId, setEmpresaId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;
    const decoded = jwtDecode(storedToken);
    // Asegura tipo consistente para comparaciones
    setEmpresaId(Number(decoded.empresa_id));
    setToken(storedToken);
  }, []);

  const fetchLockers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lockers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const filtered = data.filter(l => Number(l.empresa_id) === Number(empresaId));
      setLockers(filtered);
    } catch (error) {
      console.error('Error al obtener lockers:', error);
    }
  };

  const fetchEmpleados = async () => {
    try {
      // Si tu backend respeta el query rol_id=3, igual vuelvo a filtrar por seguridad
      const res = await fetch(`${API_URL}/api/usuarios?rol_id=3`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const filtered = data.filter(emp =>
        Number(emp.empresa_id) === Number(empresaId) &&
        String(emp.rol_id) === '3'
      );
      setEmpleados(filtered);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  };

  useEffect(() => {
    if (empresaId && token) {
      fetchLockers();
      fetchEmpleados();
    }
  }, [empresaId, token]);

  // Solo válidos si están en la lista de empleados (ya filtrada a rol_id 3)
  const isEmpleadoValido = (usuarioId) => {
    if (usuarioId === null || usuarioId === undefined || usuarioId === '') return false;
    return empleados.some(e => Number(e.id) === Number(usuarioId));
  };

  const handleUpdateLocker = async (lockerId, values) => {
    try {
      const res = await fetch(`${API_URL}/api/lockers/${lockerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Error al actualizar locker');
      }
      fetchLockers();
    } catch (error) {
      console.error('Error al actualizar locker:', error.message);
    }
  };

  const handleDeleteLocker = async (lockerId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este locker?')) return;
    try {
      const res = await fetch(`${API_URL}/api/lockers/${lockerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Error al eliminar locker');
      }
      fetchLockers();
    } catch (error) {
      console.error('Error al eliminar locker:', error.message);
    }
  };

  const handleChange = (lockerId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [lockerId]: {
        ...prev[lockerId],
        [field]: value,
      },
    }));
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Gestión de Lockers" />
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Lockers por Empresa</Typography>
          <Typography variant="body2" color="text.secondary">
            Edita, asigna, administra y elimina lockers.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {lockers.map((locker) => {
            const isActivo = locker.estado === 'activo';
            const edit = editValues[locker.id] || {};

            // usuario_id actual considerando edición
            const usuarioSeleccionado =
              edit.usuario_id !== undefined ? edit.usuario_id : (locker.usuario_id ?? null);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={locker.id}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: isActivo ? '#f1f8e9' : '#ffebee',
                    border: `2px solid ${isActivo ? '#43a047' : '#e53935'}`,
                    boxShadow: 4,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LockerIcon color={isActivo ? 'success' : 'error'} />
                      <TextField
                        size="small"
                        label="Identificador"
                        fullWidth
                        value={locker.identificador}
                        InputProps={{ readOnly: true }}
                      />
                    </Stack>

                    <TextField
                      size="small"
                      label="Ubicación"
                      fullWidth
                      value={edit.ubicacion ?? locker.ubicacion}
                      onChange={(e) => handleChange(locker.id, 'ubicacion', e.target.value)}
                    />

                    <FormControl size="small" fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={edit.tipo ?? locker.tipo}
                        label="Tipo"
                        onChange={(e) => handleChange(locker.id, 'tipo', e.target.value)}
                      >
                        <MenuItem value="frios">Fríos</MenuItem>
                        <MenuItem value="perecederos">Perecederos</MenuItem>
                        <MenuItem value="no_perecederos">No Perecederos</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Empleado</InputLabel>
                      <Select
                        value={
                          usuarioSeleccionado !== null && usuarioSeleccionado !== undefined
                            ? Number(usuarioSeleccionado)
                            : ''
                        }
                        label="Empleado"
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          // Si selecciona alguien fuera de la lista, no lo permitimos
                          if (val !== null && !isEmpleadoValido(val)) {
                            alert('Solo puedes asignar empleados con rol Trabajador (rol_id = 3) de tu empresa.');
                            return;
                          }
                          handleChange(locker.id, 'usuario_id', val);
                        }}
                      >
                        <MenuItem value="">
                          <em>Sin asignar</em>
                        </MenuItem>
                        {empleados.map((emp) => (
                          <MenuItem key={emp.id} value={Number(emp.id)}>
                            {emp.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      label="Temp. Mínima (°C)"
                      type="number"
                      fullWidth
                      value={edit.temp_min ?? locker.temp_min ?? ''}
                      onChange={(e) => handleChange(locker.id, 'temp_min', parseFloat(e.target.value))}
                    />
                    <TextField
                      size="small"
                      label="Temp. Máxima (°C)"
                      type="number"
                      fullWidth
                      value={edit.temp_max ?? locker.temp_max ?? ''}
                      onChange={(e) => handleChange(locker.id, 'temp_max', parseFloat(e.target.value))}
                    />
                    <TextField
                      size="small"
                      label="Humedad Mínima (%)"
                      type="number"
                      fullWidth
                      value={edit.hum_min ?? locker.hum_min ?? ''}
                      onChange={(e) => handleChange(locker.id, 'hum_min', parseFloat(e.target.value))}
                    />
                    <TextField
                      size="small"
                      label="Humedad Máxima (%)"
                      type="number"
                      fullWidth
                      value={edit.hum_max ?? locker.hum_max ?? ''}
                      onChange={(e) => handleChange(locker.id, 'hum_max', parseFloat(e.target.value))}
                    />
                    <TextField
                      size="small"
                      label="Peso Máximo (kg)"
                      type="number"
                      fullWidth
                      value={edit.peso_max ?? locker.peso_max ?? ''}
                      onChange={(e) => handleChange(locker.id, 'peso_max', parseFloat(e.target.value))}
                    />

                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<EstadoIcon />}
                        variant="contained"
                        color={isActivo ? 'error' : 'success'}
                        onClick={() => {
                          // Para activar, exige un empleado válido (rol 3)
                          const targetUsuarioId =
                            edit.usuario_id !== undefined ? edit.usuario_id : (locker.usuario_id ?? null);

                          if (!isActivo) {
                            // Vamos a activar
                            if (!isEmpleadoValido(targetUsuarioId)) {
                              alert('Para activar el locker debes asignar un empleado con rol_id = 3.');
                              return;
                            }
                          }

                          handleUpdateLocker(locker.id, {
                            estado: isActivo ? 'inactivo' : 'activo',
                            // Si desactivamos, opcionalmente podrías dejar la asignación; aquí no la tocamos
                            usuario_id: targetUsuarioId ?? null,
                          });
                        }}
                      >
                        {isActivo ? 'Desactivar' : 'Activar'}
                      </Button>

                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        onClick={() => {
                          const updatedUsuarioId =
                            edit.usuario_id !== undefined ? edit.usuario_id : (locker.usuario_id ?? null);

                          // Si pretende guardar con usuario asignado, validar que sea rol 3
                          if (updatedUsuarioId !== null && !isEmpleadoValido(updatedUsuarioId)) {
                            alert('Solo puedes asignar empleados con rol_id = 3.');
                            return;
                          }

                          const valuesToUpdate = {
                            ubicacion: edit.ubicacion ?? locker.ubicacion,
                            tipo: edit.tipo ?? locker.tipo,
                            usuario_id: updatedUsuarioId, // puede ser null
                            temp_min: edit.temp_min ?? locker.temp_min,
                            temp_max: edit.temp_max ?? locker.temp_max,
                            hum_min: edit.hum_min ?? locker.hum_min,
                            hum_max: edit.hum_max ?? locker.hum_max,
                            peso_max: edit.peso_max ?? locker.peso_max,
                          };

                          // Si queda sin asignar, lo forzamos a inactivo
                          if (updatedUsuarioId === null) {
                            valuesToUpdate.estado = 'inactivo';
                          }

                          handleUpdateLocker(locker.id, valuesToUpdate);
                        }}
                      >
                        Guardar cambios
                      </Button>

                      <Button
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteLocker(locker.id)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default LockersPage;
