import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';

export const UBLAppBar: React.FC = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <BankIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          UBL Credit Card Decision Engine
        </Typography>
        <Chip
          icon={<SecurityIcon />}
          label="Production Ready"
          color="secondary"
          variant="filled"
          sx={{ mr: 2 }}
        />
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
