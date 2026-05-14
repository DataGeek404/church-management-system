'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  TextField,
  Button,
  Link as MuiLink,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Church as ChurchIcon,
} from '@mui/icons-material';

export const dynamic = 'force-dynamic';

export default function Login() {
  const [email, setEmail] = useState('admin@church.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = await login(email, password);
      setSuccess(' Login successful! Redirecting...');

      // Redirect based on user role
      setTimeout(() => {
        // Normal users go directly to events page
        if (userData?.role === 'user') {
          router.push('/events');
        } else {
          // Admin and staff go to dashboard
          router.push('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError('❌ ' + (err.message || 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ChurchIcon sx={{ fontSize: 48 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  Church Management
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, lineHeight: 1.8 }}>
                Manage your church operations efficiently with our comprehensive Church Management System.
                Access members, events, finances, and more in one secure platform.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>📊</Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Member Management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Track and manage all church members
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>📍</Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Attendance Tracking
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Monitor attendance records
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>💰</Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Financial Management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Track income and expenses
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <ChurchIcon sx={{ fontSize: 48, color: '#27ae60', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                    Sign In
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Enter your credentials to access the system
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#27ae60', mr: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#27ae60', mr: 1 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(39, 174, 96, 0.3)',
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Don&apos;t have an account?{' '}
                      <MuiLink
                        component={Link}
                        href="/register"
                        sx={{
                          color: '#27ae60',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Sign Up
                      </MuiLink>
                    </Typography>
                  </Box>
                </form>

                {/* Demo Credentials */}
                {/*<Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>*/}
                {/*  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>*/}
                {/*    Demo Credentials (for testing):*/}
                {/*  </Typography>*/}
                {/*  <Typography variant="caption" sx={{ color: '#27ae60', display: 'block' }}>*/}
                {/*    //: admin@church.local*/}
                {/*  </Typography>*/}
                {/*  <Typography variant="caption" sx={{ color: '#27ae60', display: 'block' }}>*/}
                {/*   // Password: admin123*/}
                {/*  </Typography>*/}
                {/*</Box>*/}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

