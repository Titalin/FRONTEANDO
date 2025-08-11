import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  Button, Chip, Alert
} from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import { jwtDecode } from 'jwt-decode';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const API = process.env.REACT_APP_API || 'http://localhost:5000/api';

const AdministrarSuscripciones = () => {
  const [planes, setPlanes] = useState([]);
  const [suscripcionActiva, setSuscripcionActiva] = useState(true);
  const [empresaId, setEmpresaId] = useState(null);
  const [alerta, setAlerta] = useState('');
  const [planActual, setPlanActual] = useState(null);
  const [suscripcionId, setSuscripcionId] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchJSON = useCallback(async (url, opts = {}) => {
    const r = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!r.ok) throw new Error((await r.text()) || 'Request failed');
    return r.json();
  }, [token]);

  const cargarDatos = useCallback(async (empresa_id_decoded) => {
    try {
      setLoading(true);
      const [dataPlanes, suscripciones] = await Promise.all([
        fetchJSON(`${API}/planes`),
        fetchJSON(`${API}/suscripciones`)
      ]);

      setPlanes(dataPlanes);

      const activa = suscripciones.find(
        s => s.empresa_id === empresa_id_decoded && s.estado === 'activa'
      );

      if (!activa) {
        setSuscripcionActiva(false);
        setPlanActual(null);
        setSuscripcionId(null);
        setAlerta('No tienes una suscripción activa. Selecciona un plan para continuar.');
      } else {
        const plan = dataPlanes.find(p => p.id === activa.plan_id);
        setSuscripcionActiva(true);
        setPlanActual(plan || null);
        setSuscripcionId(activa.id);
        setAlerta('Tienes una suscripción activa.');
      }
    } catch (err) {
      console.error('Error al cargar planes o suscripciones:', err);
      setAlerta('Error al cargar información.');
    } finally {
      setLoading(false);
    }
  }, [fetchJSON]);

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setEmpresaId(decoded.empresa_id);
      cargarDatos(decoded.empresa_id);
    } catch (e) {
      console.error('Token inválido:', e);
    }
  }, [token, cargarDatos]);

  const cancelarSuscripcion = async () => {
    if (!suscripcionId) return;
    try {
      setLoading(true);
      await fetchJSON(`${API}/suscripciones/${suscripcionId}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'cancelada' })
      });
      setAlerta('La suscripción fue cancelada correctamente.');
      if (empresaId) await cargarDatos(empresaId);
    } catch (error) {
      console.error('Error al cancelar:', error);
      setAlerta('Error al cancelar la suscripción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Gestión de Suscripciones" />

        <Paper sx={{ p: 3 }}>
          {alerta && (
            <Alert severity={!suscripcionActiva ? 'warning' : 'success'} sx={{ mb: 2 }}>
              {alerta}
            </Alert>
          )}

          {!suscripcionActiva ? (
            <>
              <Typography variant="h6" gutterBottom>
                Elige un plan para activar tu suscripción:
              </Typography>

              <Grid container spacing={2}>
                {planes.map((plan) => (
                  <Grid item xs={12} sm={4} key={plan.id}>
                    <Card sx={{ boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {plan.nombre}
                        </Typography>
                        <Chip label="Mensual" color="info" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Límite de usuarios: {plan.limite_usuarios}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lockers: {plan.lockers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Costo: ${parseFloat(plan.costo).toFixed(2)}/mes
                        </Typography>
                        <Box mt={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            onClick={() => setPlanSeleccionado(plan)}
                          >
                            Pagar con PayPal
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {planSeleccionado && (
                <Box mt={3}>
                  <Typography variant="body1" gutterBottom>
                    Pagando el plan: {planSeleccionado.nombre} ($
                    {parseFloat(planSeleccionado.costo).toFixed(2)})
                  </Typography>

                  <PayPalScriptProvider options={{ 'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      createOrder={async () => {
                        const r = await fetch(`${API}/paypal/create-order`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: planSeleccionado.costo })
                        });
                        const data = await r.json();
                        return data.id;
                      }}
                      onApprove={async (data) => {
                        try {
                          setLoading(true);
                          // Mandamos empresa_id + plan_id (el backend crea/activa y ajusta lockers)
                          const captureResp = await fetch(`${API}/paypal/capture-order/${data.orderID}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              empresa_id: empresaId,
                              plan_id: planSeleccionado.id
                            })
                          });
                          const json = await captureResp.json();
                          if (!captureResp.ok) throw new Error(json.error || 'Error al capturar');

                          setAlerta(json.message || 'Pago capturado y suscripción activada.');
                          setPlanSeleccionado(null);
                          if (empresaId) await cargarDatos(empresaId);
                        } catch (e) {
                          console.error(e);
                          setAlerta('Hubo un problema al procesar el pago.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      onCancel={() => {
                        setPlanSeleccionado(null);
                      }}
                      onError={(err) => {
                        console.error(err);
                        setAlerta('Error en el pago con PayPal.');
                      }}
                    />
                  </PayPalScriptProvider>
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Plan actual: {planActual?.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios permitidos: {planActual?.limite_usuarios}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lockers incluidos: {planActual?.lockers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Costo mensual: ${parseFloat(planActual?.costo || 0).toFixed(2)}
              </Typography>

              <Box mt={2}>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={loading}
                  onClick={cancelarSuscripcion}
                >
                  Cancelar suscripción
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdministrarSuscripciones;
