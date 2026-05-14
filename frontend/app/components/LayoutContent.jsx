'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Box, AppBar, Toolbar, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import Sidebar from '@/app/components/Sidebar';

export function LayoutContent({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Pages that don't require authentication
  const publicPages = ['/login', '/register', '/'];
  const isPublicPage = publicPages.includes(pathname);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
          color: 'white',
          fontSize: '18px',
        }}
      >
        Loading...
      </Box>
    );
  }

  if (!isAuthenticated && !isPublicPage) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
          color: 'white',
        }}
      >
        Redirecting to login...
      </Box>
    );
  }

  if (isPublicPage) {
    return children;
  }

  // Authenticated - show full layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: 'white',
            color: '#333',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            mt: isMobile ? '64px' : 0,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#27ae60',
                display: { xs: 'none', md: 'block' },
              }}
            >
              Church Management System
            </Typography>
            <Button
              startIcon={<PersonIcon />}
              onClick={() => router.push('/profile')}
              sx={{
                color: '#27ae60',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(39, 174, 96, 0.1)',
                },
              }}
            >
              {user?.firstName || 'Profile'}
            </Button>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

