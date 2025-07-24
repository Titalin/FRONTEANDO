// src/pages/LoginPage.jsx

import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';
import Logo from '../components/common/Logo';

const LoginPage = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#0d1b2a" // Azul oscuro moderno
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box mt={1}>
            <Logo />
          </Box>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
