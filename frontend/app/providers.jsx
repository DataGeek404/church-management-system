'use client';

import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { MuiThemeProvider } from '@/app/components/MuiThemeProvider';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MuiThemeProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </MuiThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

