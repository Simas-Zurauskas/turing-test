'use client';
import theme, { colors } from '@/lib/theme';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RegistryProps {
  children?: React.ReactNode;
}

const Registry: React.FC<RegistryProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <MUIThemeProvider theme={theme}>
      <EmotionThemeProvider theme={{ ...theme, colors }}>
        <ToastContainer hideProgressBar autoClose={4000} theme="colored" pauseOnHover position="top-center" />
        <CssBaseline />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </EmotionThemeProvider>
    </MUIThemeProvider>
  );
};

export default Registry;
