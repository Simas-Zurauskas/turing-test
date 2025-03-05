'use client';
import { createTheme } from '@mui/material/styles';

export const colors = {
  text: '#1F2937',
  primary: '#2F4E79',
  secondary: '#4E6688',
  textWhite: '#F9FAFB',
  blue: '#2E5EA1',
  success: '#2a8314',
  sucessPale: '#d4eed4',
  error: '#d32f2f',
  errorPale: '#FFD6D6',
  appBgBack: '#1F2937',
  appBgFront: '#F9FAFB',
  asideActive: '#4e6688',
  card: '#F2F8FF',
  shade: '#e5f1ff',
  border: '#e0e0e0',
};

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-montserrat)',
    allVariants: {
      color: colors.text,
    },
    h1: {
      fontSize: '2.15rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // backgroundColor: colors.background,
        },
      },
    },
  },
});

export default theme;
