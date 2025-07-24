import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  InsertChart as ReportIcon,
  PersonAdd as RegisterIcon,
  Visibility as MonitorIcon,
  ShowChart as ChartIcon,
  Lock as LockersIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  BarChart as GraficasIcon,
} from '@mui/icons-material';
import Logo from '../common/Logo';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';


const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Error al cerrar sesión en backend');
      }
    } catch (error) {
      console.error('Error al comunicarse con backend para logout:', error);
    }

    localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.rol_id === 1;
  const isAdminEmpresa = user?.rol_id === 2;

  const superAdminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Reportes', icon: <ReportIcon />, path: '/admin/reports' },
    { text: 'Registrar Empresa', icon: <RegisterIcon />, path: '/admin/register-company' },
    { text: 'Empresa Status', icon: <BusinessIcon />, path: '/admin/charts' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  const adminEmpresaMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
    { text: 'Monitoreo', icon: <MonitorIcon />, path: '/cliente/monitoreo' },
    { text: 'Lockers', icon: <LockersIcon />, path: '/cliente/lockers' },
    { text: 'Suscripciones', icon: <ReportIcon />, path: '/cliente/suscripciones' },
    { text: 'Registrar Empleado', icon: <PersonIcon />, path: '/cliente/register-user' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/cliente/settings' }
  ];

  const clienteMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
    { text: 'Monitoreo Tiempo Real', icon: <MonitorIcon />, path: '/cliente/monitoreo' },
  ];

  let menuItems = clienteMenuItems;
  if (isSuperAdmin) {
    menuItems = superAdminMenuItems;
  } else if (isAdminEmpresa) {
    menuItems = adminEmpresaMenuItems;
  }

  let drawerBgColor = '#37474f';
  if (isSuperAdmin) drawerBgColor = '#1a2540';
  else if (isAdminEmpresa) drawerBgColor = '#263238';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: drawerBgColor,
          color: '#ffffff',
        },
      }}
    >
      <Logo />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon sx={{ color: '#ffffff' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
