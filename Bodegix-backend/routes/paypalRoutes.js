const express = require("express");
const router = express.Router();
const { client } = require("../config/paypal");
const paypal = require("@paypal/checkout-server-sdk");
const { Suscripciones } = require("../models"); // Sequelize

// Crear orden
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount || "10.00",
        },
      },
    ],
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error creando orden:", err);
    res.status(500).send("Error creando orden");
  }
});

// Capturar pago y activar suscripción
router.post("/capture-order/:orderID", async (req, res) => {
  const { orderID } = req.params;
  const { empresa_id } = req.body; // viene del frontend

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);

    // Guardar suscripción en MySQL
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    await Suscripciones.create({
      empresa_id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: "activa",
    });

    res.json({
      message: "Pago completado y suscripción activada",
      details: capture.result,
    });
  } catch (err) {
    console.error("Error capturando orden:", err);
    res.status(500).send("Error capturando orden");
  }
});

module.exports = router;
