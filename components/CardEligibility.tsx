import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

interface CardEligibilityProps {
  assignedCreditLimit?: number;
  cardType?: string;
}

export const CardEligibility: React.FC<CardEligibilityProps> = ({
  assignedCreditLimit = 0,
  cardType = '',
}) => {
  const cardTypes = [
    {
      name: 'SILVER',
      range: '25,000 - 125,000',
      minLimit: 25000,
      maxLimit: 125000,
      icon: <VerifiedIcon />,
      color: '#9e9e9e',
      bgColor: 'rgba(158, 158, 158, 0.1)',
    },
    {
      name: 'GOLD',
      range: '125,001 - 299,999',
      minLimit: 125001,
      maxLimit: 299999,
      icon: <StarIcon />,
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)',
    },
    {
      name: 'PLATINUM',
      range: '300,000 - 7,000,000',
      minLimit: 300000,
      maxLimit: 7000000,
      icon: <DiamondIcon />,
      color: '#e91e63',
      bgColor: 'rgba(233, 30, 99, 0.1)',
    },
  ];

  const isEligible = (minLimit: number, maxLimit: number) => {
    return assignedCreditLimit >= minLimit && assignedCreditLimit <= maxLimit;
  };

  const getEligibilityStatus = (cardName: string) => {
    if (cardType && cardType.toUpperCase() === cardName) {
      return 'ASSIGNED';
    }
    const card = cardTypes.find(c => c.name === cardName);
    if (card && isEligible(card.minLimit, card.maxLimit)) {
      return 'ELIGIBLE';
    }
    return 'NOT_ELIGIBLE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#4caf50';
      case 'ELIGIBLE': return '#2196f3';
      case 'NOT_ELIGIBLE': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return <CheckCircleIcon />;
      case 'ELIGIBLE': return <CheckCircleIcon />;
      case 'NOT_ELIGIBLE': return <CancelIcon />;
      default: return <CancelIcon />;
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        💳 Card Eligibility Options
      </Typography>
      
      <Grid container spacing={2}>
        {cardTypes.map((card) => {
          const status = getEligibilityStatus(card.name);
          const statusColor = getStatusColor(status);
          
          return (
            <Grid size={{ xs: 12, sm: 4 }} key={card.name}>
              <Paper
                elevation={status === 'ASSIGNED' ? 8 : 2}
                sx={{
                  p: 2,
                  border: status === 'ASSIGNED' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  backgroundColor: status === 'ASSIGNED' ? card.bgColor : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      color: card.color,
                      fontSize: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                
                <Typography 
                  variant="h6" 
                  align="center" 
                  gutterBottom
                  sx={{ color: card.color, fontWeight: 600 }}
                >
                  {card.name} CARD
                </Typography>
                
                <Typography 
                  variant="body2" 
                  align="center" 
                  color="text.secondary" 
                  gutterBottom
                >
                  PKR {card.range}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Chip
                    icon={getStatusIcon(status)}
                    label={status.replace('_', ' ')}
                    sx={{
                      backgroundColor: statusColor,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                </Box>
                
                {status === 'ASSIGNED' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="caption" 
                      display="block" 
                      align="center"
                      sx={{ 
                        backgroundColor: '#e8f5e8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: '#2e7d32',
                        fontWeight: 600,
                      }}
                    >
                      Assigned: PKR {assignedCreditLimit.toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      {assignedCreditLimit > 0 && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2, backgroundColor: '#f3e5f5', border: '1px solid #e1bee7' }}>
            <Typography variant="body2" align="center" color="text.secondary">
              <strong>Final Credit Limit:</strong> PKR {assignedCreditLimit.toLocaleString()} 
              {cardType && (
                <>
                  {' '} | <strong>Card Type:</strong> {cardType}
                </>
              )}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
