import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';
import dayjs from 'dayjs';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Reports = () => {
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [ingresosPorEmpresa, setIngresosPorEmpresa] = useState([]);
  const [ingresosMensuales, setIngresosMensuales] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month'));
  const [fechaFin, setFechaFin] = useState(dayjs().endOf('month'));

  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  const cargarTotales = () => {
    fetch('http://localhost:5000/api/reports/ingresos/totales')
      .then(res => res.json())
      .then(data => setIngresosTotales(Number(data.ingresos_totales) || 0))
      .catch(() => setIngresosTotales(0));
  };

  const cargarPorEmpresa = () => {
    const inicio = fechaInicio.format('YYYY-MM-DD');
    const fin = fechaFin.format('YYYY-MM-DD');

    fetch(`http://localhost:5000/api/reports/ingresos/por-empresa?fecha_inicio=${inicio}&fecha_fin=${fin}`)
      .then(res => res.json())
      .then(data => setIngresosPorEmpresa(Array.isArray(data) ? data : []))
      .catch(() => setIngresosPorEmpresa([]));

    fetch(`http://localhost:5000/api/reports/ingresos/totales-por-fecha?fecha_inicio=${inicio}&fecha_fin=${fin}`)
      .then(res => res.json())
      .then(data => setIngresosTotales(Number(data.ingresos_totales) || 0))
      .catch(() => setIngresosTotales(0));
  };

  const cargarMensuales = () => {
    fetch('http://localhost:5000/api/reports/ingresos/mensuales')
      .then(res => res.json())
      .then(data => setIngresosMensuales(Array.isArray(data) ? data : []))
      .catch(() => setIngresosMensuales([]));
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(ingresosPorEmpresa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IngresosPorEmpresa");
    XLSX.writeFile(wb, "reporte_ingresos.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Ingresos", 14, 20);

    doc.setFontSize(12);
    doc.text(`Periodo: ${fechaInicio.format('DD/MM/YYYY')} - ${fechaFin.format('DD/MM/YYYY')}`, 14, 30);
    doc.text(`Ingresos Totales: $${ingresosTotales.toFixed(2)}`, 14, 37);

    // Tabla con datos
    const tableData = ingresosPorEmpresa.map(e => [e.empresa, `$${Number(e.ingresos).toFixed(2)}`]);
    autoTable(doc, {
      startY: 45,
      head: [['Empresa', 'Ingresos']],
      body: tableData,
    });

    // Agregar gráficas como imágenes
    const yPosition = doc.lastAutoTable.finalY + 10;
    if (barChartRef.current) {
      const barImg = barChartRef.current.toBase64Image();
      doc.addImage(barImg, 'PNG', 14, yPosition, 180, 70);
    }

    if (lineChartRef.current) {
      const lineImg = lineChartRef.current.toBase64Image();
      doc.addImage(lineImg, 'PNG', 14, yPosition + 80, 180, 70);
    }

    doc.save("reporte_ingresos.pdf");
  };

  useEffect(() => {
    cargarTotales();
    cargarMensuales();
  }, []);

  const dataChartBar = {
    labels: ingresosPorEmpresa.map(e => e.empresa),
    datasets: [
      {
        label: 'Ingresos',
        data: ingresosPorEmpresa.map(e => e.ingresos),
        backgroundColor: ingresosPorEmpresa.map(() =>
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
        )
      }
    ]
  };

  const dataChartLine = {
    labels: ingresosMensuales.map(e => e.mes),
    datasets: [
      {
        label: 'Ingresos mensuales',
        data: ingresosMensuales.map(e => e.ingresos),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.3
      }
    ]
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Topbar title="Reportes" />

        {/* Ingresos Totales */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Ingresos Totales</Typography>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
            ${Number(ingresosTotales).toFixed(2)}
          </Typography>
        </Paper>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filtrar por fecha</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Fecha inicio" value={fechaInicio} onChange={setFechaInicio} />
            <DatePicker label="Fecha fin" value={fechaFin} onChange={setFechaFin} />
          </LocalizationProvider>
          <Button variant="contained" sx={{ ml: 2 }} onClick={cargarPorEmpresa}>
            Buscar
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={exportarExcel}>
            Exportar Excel
          </Button>
          <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={exportarPDF}>
            Exportar PDF
          </Button>
        </Paper>

        {/* Gráfica por empresa */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Ingresos por empresa</Typography>
          <Bar ref={barChartRef} data={dataChartBar} />
        </Paper>

        {/* Gráfica de línea mensual */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Evolución mensual de ingresos</Typography>
          <Line ref={lineChartRef} data={dataChartLine} />
        </Paper>
      </Box>
    </Box>
  );
};

export default Reports;