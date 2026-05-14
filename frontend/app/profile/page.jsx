'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../api/client';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

export default function ProfilePage() {
  // Allow all authenticated users to access profile
  useRoleAccess(['admin', 'staff', 'user']);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profileResponse, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
    retry: false,
  });

  useEffect(() => {
    if (profileResponse?.data) {
      setProfileForm({
        firstName: profileResponse.data.firstName || '',
        lastName: profileResponse.data.lastName || '',
        email: profileResponse.data.email || '',
      });
    }
  }, [profileResponse]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      showMessage('✅ Profile updated successfully', 'success');
      setIsEditingProfile(false);
      refetch();
    },
    onError: (error) => {
      showMessage(`❌ ${error.message}`, 'error');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      showMessage('✅ Password changed successfully', 'success');
      setIsEditingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      showMessage(`❌ ${error.message}`, 'error');
    },
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      showMessage('All fields are required', 'error');
      return;
    }
    updateProfileMutation.mutate(profileForm);
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage('All password fields are required', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(34, 153, 84, 0.1) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(39, 174, 96, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}>
        <Box sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '3rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
        }}>
          {profileResponse?.data?.firstName ? profileResponse.data.firstName[0].toUpperCase() : 'U'}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60', mb: 0.5 }}>
            {profileResponse?.data?.firstName} {profileResponse?.data?.lastName}
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 0.5 }}>
            {profileResponse?.data?.email}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Manage your personal information and security settings
          </Typography>
        </Box>
      </Box>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.05) 0%, rgba(34, 153, 84, 0.05) 100%)',
        border: '1px solid rgba(39, 174, 96, 0.2)'
      }}>
        <CardHeader
          title="Personal Information"
          titleTypographyProps={{ sx: { color: '#27ae60', fontWeight: 'bold' } }}
          action={
            !isEditingProfile && (
              <Button
                startIcon={<Edit />}
                onClick={() => setIsEditingProfile(true)}
                sx={{ color: '#27ae60' }}
              >
                Edit
              </Button>
            )
          }
        />
        <Divider />
        <CardContent>
          {!isEditingProfile && profileResponse?.data && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      FIRST NAME
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#27ae60', fontWeight: '600' }}>
                      {profileResponse.data.firstName || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      LAST NAME
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#27ae60', fontWeight: '600' }}>
                      {profileResponse.data.lastName || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      EMAIL ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: '500' }}>
                      {profileResponse.data.email || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      ROLE
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: '600',
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        background: profileResponse.data.role === 'admin' ? '#e74c3c' : profileResponse.data.role === 'staff' ? '#3498db' : '#95a5a6'
                      }}
                    >
                      {profileResponse.data.role?.toUpperCase() || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      STATUS
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: '600',
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        background: profileResponse.data.status === 'active' ? '#27ae60' : '#e74c3c'
                      }}
                    >
                      {profileResponse.data.status?.toUpperCase() || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      MEMBER SINCE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: '500' }}>
                      {profileResponse.data.createdDate
                        ? new Date(profileResponse.data.createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '—'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {isEditingProfile && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  sx={{ background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' }}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setIsEditingProfile(false);
                    refetch();
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
          )}
        </CardContent>
      </Card>

      <Card sx={{
        background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(192, 57, 43, 0.05) 100%)',
        border: '1px solid rgba(231, 76, 60, 0.2)'
      }}>
        <CardHeader
          title="Security"
          titleTypographyProps={{ sx: { color: '#e74c3c', fontWeight: 'bold' } }}
          action={
            !isEditingPassword && (
              <Button
                startIcon={<Edit />}
                onClick={() => setIsEditingPassword(true)}
                sx={{ color: '#e74c3c' }}
              >
                Change Password
              </Button>
            )
          }
        />
        <Divider />
        <CardContent>
          {!isEditingPassword && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  🔒 Your password is securely encrypted and stored
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Last password change: {profileResponse?.data?.updatedDate
                    ? new Date(profileResponse.data.updatedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </Typography>
              </Box>
            </Box>
          )}

          {isEditingPassword && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending}
                    sx={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }}
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    disabled={changePasswordMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

