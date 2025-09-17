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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'white' }}>
          UBL Credit Card Decision Engine
        </Typography>
        <Chip
          icon={<SecurityIcon style={{ color: 'white' }} />}
          label="Production Ready"
          variant="filled"
          sx={{ 
            mr: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '& .MuiChip-label': {
              color: 'white'
            }
          }}
        />
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
