import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Topbar = ({ title }) => {
    const { user } = React.useContext(AuthContext);

    const isAdmin = user?.rol_id === 1 || user?.rol_id === 2;

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: isAdmin ? '#2d3e63' : '#455a64', 
                color: '#fff',
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
            }}
        >
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                {isAdmin && (
                    <IconButton color="inherit">
                        <Badge badgeContent={0} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                )}
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 2 }}>
                    {user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                    {user?.nombre || user?.email}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;
