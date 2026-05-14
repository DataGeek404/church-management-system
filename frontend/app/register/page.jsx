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
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Church as ChurchIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export const dynamic = 'force-dynamic';

const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;

  if (password.length >= 6) strength += 25;
  if (password.length >= 10) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) strength += 25;

  return strength;
};

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { register } = useAuth();
  const router = useRouter();

  const passwordStrength = calculatePasswordStrength(password);

  const getStrengthLabel = () => {
    if (passwordStrength < 25) return { label: 'Too Weak', color: '#e74c3c' };
    if (passwordStrength < 50) return { label: 'Weak', color: '#e67e22' };
    if (passwordStrength < 75) return { label: 'Fair', color: '#f39c12' };
    return { label: 'Strong', color: '#27ae60' };
  };

  const validateForm = () => {
    const errors = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Invalid email format';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
      setSuccess(' Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError(' ' + (err.message || 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel();

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
        <Grid container spacing={4} alignItems="flex-start">
          {/* Left Side - Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ChurchIcon sx={{ fontSize: 48 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  Church Management
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Get Started Today
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, lineHeight: 1.8 }}>
                Join our community and start managing your church with ease. Create your account
                and unlock powerful features for member management, event planning, and financial tracking.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Easy to Use
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Intuitive interface for all users
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Secure & Reliable
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Your data is protected with encryption
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      24/7 Support
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Get help when you need it
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Register Form */}
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
                    Create Account
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Join our church management system
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        disabled={loading}
                        error={!!validationErrors.firstName}
                        helperText={validationErrors.firstName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#27ae60', mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        disabled={loading}
                        error={!!validationErrors.lastName}
                        helperText={validationErrors.lastName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#27ae60', mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        disabled={loading}
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: '#27ae60', mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        disabled={loading}
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
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

                      {password && (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Password Strength
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: strengthInfo.color }}
                            >
                              {strengthInfo.label}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: strengthInfo.color,
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        disabled={loading}
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#27ae60', mr: 1 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                disabled={loading}
                                size="small"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                      mt: 4,
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Already have an account?{' '}
                      <MuiLink
                        component={Link}
                        href="/login"
                        sx={{
                          color: '#27ae60',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Sign In
                      </MuiLink>
                    </Typography>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

