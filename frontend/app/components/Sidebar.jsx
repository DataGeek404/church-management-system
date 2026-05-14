'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarMonth as CalendarMonthIcon,
  Mail as MailIcon,
  BarChart as AnalyticsIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon, roles: ['admin', 'staff'] },
    { label: 'Members', href: '/members', icon: PeopleIcon, roles: ['admin', 'staff'] },
    { label: 'Users', href: '/users', icon: SecurityIcon, roles: ['admin'] },
    { label: 'Attendance', href: '/attendance', icon: EventNoteIcon, roles: ['admin', 'staff'] },
    { label: 'Financial', href: '/financial', icon: AttachMoneyIcon, roles: ['admin', 'staff'] },
    { label: 'Events', href: '/events', icon: CalendarMonthIcon, roles: ['admin', 'staff', 'user'] },
    { label: 'Communications', href: '/communications', icon: MailIcon, roles: ['admin', 'staff'] },
    { label: 'Reports', href: '/reports', icon: AnalyticsIcon, roles: ['admin', 'staff'] },
    { label: 'Logs', href: '/logs', icon: InfoIcon, roles: ['admin'] },
    { label: 'Profile', href: '/profile', icon: PersonIcon, roles: ['admin', 'staff', 'user'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true; // If no roles specified, show to everyone
    return item.roles.includes(user?.role || 'user');
  });

  const isActive = (href) => pathname === href;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
          CMS
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              onClick={() => isMobile && setIsOpen(false)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(39, 174, 96, 0.15)',
                  borderLeft: '3px solid #27ae60',
                  '&:hover': {
                    backgroundColor: 'rgba(39, 174, 96, 0.25)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.href) ? '#27ae60' : 'inherit' }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* User Profile & Actions */}
      <Box sx={{ p: 2 }}>
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'rgba(39, 174, 96, 0.1)',
            }}
          >
            <Avatar sx={{ width: 40, height: 40, backgroundColor: '#27ae60' }}>
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {user.role.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            backgroundColor: '#27ae60',
            '&:hover': {
              backgroundColor: '#229954',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ backgroundColor: '#27ae60' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setIsOpen(!isOpen)}
              sx={{ mr: 2 }}
            >
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              CMS
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: 280,
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e0e0e0',
            height: '100vh',
            overflow: 'auto',
            position: 'sticky',
            top: 0,
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={() => setIsOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              backgroundColor: '#f5f5f5',
              mt: '64px',
              height: 'calc(100% - 64px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}

