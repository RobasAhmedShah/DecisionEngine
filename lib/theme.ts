import { createTheme } from '@mui/material/styles';

// UBL Bank Color Palette (Professional Banking Colors)
const ublColors = {
  // Primary UBL Green
  primary: {
    main: '#006B3F', // UBL Signature Green
    light: '#4CAF50',
    dark: '#004D2F',
    contrastText: '#FFFFFF',
  },
  // Secondary Gold/Yellow (Premium Banking)
  secondary: {
    main: '#FFD700', // Elegant Gold
    light: '#FFF176',
    dark: '#FFA000',
    contrastText: '#000000',
  },
  // Professional Success Colors
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  // Warning Colors (Financial Alerts)
  warning: {
    main: '#FF8C00', // Professional Orange
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#FFFFFF',
  },
  // Error Colors (Risk Indicators)
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  // Information Colors
  info: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  // Background & Surface Colors
  background: {
    default: '#F8F9FA', // Light professional background
    paper: '#FFFFFF',
    light: '#FAFBFC',
    dark: '#E8F5E8', // Subtle green tint
  },
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },
  // Divider & Border Colors
  divider: '#E0E0E0',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Create the Material UI Theme
export const ublTheme = createTheme({
  palette: {
    mode: 'light',
    primary: ublColors.primary,
    secondary: ublColors.secondary,
    success: ublColors.success,
    warning: ublColors.warning,
    error: ublColors.error,
    info: ublColors.info,
    background: {
      default: ublColors.background.default,
      paper: ublColors.background.paper,
    },
    text: ublColors.text,
    divider: ublColors.divider,
    grey: ublColors.grey,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      textTransform: 'none', // Remove uppercase transformation
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for modern look
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 107, 63, 0.08), 0px 1px 2px rgba(0, 107, 63, 0.12)',
    '0px 1px 5px rgba(0, 107, 63, 0.08), 0px 2px 2px rgba(0, 107, 63, 0.12)',
    '0px 1px 8px rgba(0, 107, 63, 0.08), 0px 3px 4px rgba(0, 107, 63, 0.12)',
    '0px 2px 4px rgba(0, 107, 63, 0.08), 0px 4px 5px rgba(0, 107, 63, 0.12)',
    '0px 3px 5px rgba(0, 107, 63, 0.08), 0px 5px 8px rgba(0, 107, 63, 0.12)',
    '0px 3px 5px rgba(0, 107, 63, 0.08), 0px 6px 10px rgba(0, 107, 63, 0.12)',
    '0px 4px 5px rgba(0, 107, 63, 0.08), 0px 8px 10px rgba(0, 107, 63, 0.12)',
    '0px 5px 5px rgba(0, 107, 63, 0.08), 0px 10px 14px rgba(0, 107, 63, 0.12)',
    '0px 5px 6px rgba(0, 107, 63, 0.08), 0px 12px 17px rgba(0, 107, 63, 0.12)',
    '0px 6px 6px rgba(0, 107, 63, 0.08), 0px 14px 20px rgba(0, 107, 63, 0.12)',
    '0px 6px 7px rgba(0, 107, 63, 0.08), 0px 16px 24px rgba(0, 107, 63, 0.12)',
    '0px 7px 8px rgba(0, 107, 63, 0.08), 0px 18px 28px rgba(0, 107, 63, 0.12)',
    '0px 7px 8px rgba(0, 107, 63, 0.08), 0px 20px 32px rgba(0, 107, 63, 0.12)',
    '0px 7px 9px rgba(0, 107, 63, 0.08), 0px 22px 35px rgba(0, 107, 63, 0.12)',
    '0px 8px 9px rgba(0, 107, 63, 0.08), 0px 24px 38px rgba(0, 107, 63, 0.12)',
    '0px 8px 10px rgba(0, 107, 63, 0.08), 0px 26px 42px rgba(0, 107, 63, 0.12)',
    '0px 8px 11px rgba(0, 107, 63, 0.08), 0px 28px 45px rgba(0, 107, 63, 0.12)',
    '0px 9px 11px rgba(0, 107, 63, 0.08), 0px 30px 48px rgba(0, 107, 63, 0.12)',
    '0px 9px 12px rgba(0, 107, 63, 0.08), 0px 32px 52px rgba(0, 107, 63, 0.12)',
    '0px 10px 13px rgba(0, 107, 63, 0.08), 0px 34px 55px rgba(0, 107, 63, 0.12)',
    '0px 10px 13px rgba(0, 107, 63, 0.08), 0px 36px 58px rgba(0, 107, 63, 0.12)',
    '0px 10px 14px rgba(0, 107, 63, 0.08), 0px 38px 61px rgba(0, 107, 63, 0.12)',
    '0px 11px 14px rgba(0, 107, 63, 0.08), 0px 40px 65px rgba(0, 107, 63, 0.12)',
    '0px 11px 15px rgba(0, 107, 63, 0.08), 0px 42px 68px rgba(0, 107, 63, 0.12)',
  ],
  spacing: 8, // 8px base spacing unit
  components: {
    // Global theme component overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: ublColors.background.default,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: ublColors.primary.main,
          boxShadow: '0px 2px 8px rgba(0, 107, 63, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 16px rgba(0, 107, 63, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(0, 107, 63, 0.12)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 107, 63, 0.02)',
          borderBottom: `1px solid ${ublColors.divider}`,
        },
        title: {
          fontWeight: 600,
          color: ublColors.primary.main,
        },
        subheader: {
          color: ublColors.text.secondary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 107, 63, 0.15)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${ublColors.primary.main} 30%, ${ublColors.primary.light} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${ublColors.primary.dark} 30%, ${ublColors.primary.main} 90%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(45deg, ${ublColors.secondary.main} 30%, ${ublColors.secondary.light} 90%)`,
          color: ublColors.text.primary,
          '&:hover': {
            background: `linear-gradient(45deg, ${ublColors.secondary.dark} 30%, ${ublColors.secondary.main} 90%)`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(0, 107, 63, 0.1)',
          color: ublColors.primary.main,
          border: `1px solid rgba(0, 107, 63, 0.2)`,
        },
        colorSecondary: {
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
          color: ublColors.secondary.dark,
          border: `1px solid rgba(255, 215, 0, 0.3)`,
        },
        colorSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: ublColors.success.main,
          border: `1px solid rgba(76, 175, 80, 0.2)`,
        },
        colorError: {
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: ublColors.error.main,
          border: `1px solid rgba(211, 47, 47, 0.2)`,
        },
        colorWarning: {
          backgroundColor: 'rgba(255, 140, 0, 0.1)',
          color: ublColors.warning.main,
          border: `1px solid rgba(255, 140, 0, 0.2)`,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '8px',
        },
        bar: {
          borderRadius: '4px',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: ublColors.primary.main,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: ublColors.primary.light,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: ublColors.primary.main,
            borderWidth: '2px',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&.Mui-focused': {
            color: ublColors.primary.main,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default Material UI gradient
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 107, 63, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 107, 63, 0.10)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 107, 63, 0.12)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: ublColors.divider,
        },
      },
    },
  },
});

export default ublTheme;
