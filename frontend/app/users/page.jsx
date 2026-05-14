'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import {
  Container,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Typography,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/client';

export default function UserManager() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const queryClient = useQueryClient();

  useRoleAccess(['admin']);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'member',
  });

  // Fetch users with filters
  const { data: usersResponse, isLoading, error: usersError, refetch } = useQuery({
    queryKey: ['users', searchTerm, filterRole, filterStatus],
    queryFn: async () => {
      const response = await userApi.getUsers({
        search: searchTerm || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        limit: 100,
      });
      return response.data;
    },
    staleTime: 30000,
    retry: false,
  });

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

  // Fetch statistics
  const { data: statsResponse, error: statsError } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await userApi.getStatistics();
      return response.data;
    },
    staleTime: 30000,
    retry: false,
  });

  const stats = statsResponse?.data || { total: 0, active: 0, admins: 0, staff: 0 };

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data) => userApi.createUser(data),
    onSuccess: () => {
      showMessage('✅ User created successfully', 'success');
      setOpenAddDialog(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
    },
    onError: (error) => {
      showMessage(`❌ Error creating user: ${error.message}`, 'error');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => userApi.updateUser(id, data),
    onSuccess: () => {
      showMessage('✅ User updated successfully', 'success');
      setOpenEditDialog(false);
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
    },
    onError: (error) => {
      showMessage(`❌ Error updating user: ${error.message}`, 'error');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => userApi.deleteUser(id),
    onSuccess: () => {
      showMessage('✅ User deleted successfully', 'success');
      setOpenDeleteDialog(false);
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
    },
    onError: (error) => {
      showMessage(`❌ Error deleting user: ${error.message}`, 'error');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => userApi.toggleUserStatus(id, status),
    onSuccess: () => {
      showMessage('✅ User status updated', 'success');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      showMessage(`❌ Error updating status: ${error.message}`, 'error');
    },
  });

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAddClick = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
    setOpenAddDialog(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (openAddDialog && !formData.password) {
      showMessage('Password is required for new users', 'error');
      return;
    }

    if (openAddDialog) {
      createMutation.mutate(formData);
    } else {
      const { password, ...updateData } = formData;
      updateMutation.mutate({ id: selectedUser.id, ...updateData });
    }
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedUser.id);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({
      id: user.id,
      status: newStatus,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (usersError || statsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Backend Connection Error</Typography>
          <Typography>Make sure the backend server is running on port 3001</Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' }}
            onClick={() => refetch()}
          >
            Retry Connection
          </Button>
        </Alert>
      </Container>
    );
  }

  // Mobile User Card Component
  const UserCard = ({ user }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 0.5 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block' }}>
              {user.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <Chip
              label={user.role}
              size="small"
              color={user.role === 'admin' ? 'error' : user.role === 'staff' ? 'warning' : 'default'}
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={user.status === 'active' ? 'Active' : 'Inactive'}
            size="small"
            color={user.status === 'active' ? 'success' : 'error'}
            sx={{ fontSize: '0.65rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <IconButton
            size="small"
            onClick={() => handleToggleStatus(user)}
            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            {user.status === 'active' ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditClick(user)}
            title="Edit"
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(user)}
            title="Delete"
            color="error"
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60', mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            👥 User Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
            Manage users, roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Add New User
        </Button>
      </Box>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(34, 153, 84, 0.1) 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Total Users
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#27ae60', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Active Users
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3498db', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Administrators
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e74c3c', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {stats.admins}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(230, 126, 34, 0.1) 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Staff Members
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f39c12', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {stats.staff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.05) 0%, rgba(34, 153, 84, 0.05) 100%)',
        border: '1px solid rgba(39, 174, 96, 0.2)'
      }}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper elevation={2}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No users found
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'admin' ? 'error' : user.role === 'staff' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status === 'active' ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.status === 'active' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.status === 'active' ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {users.length === 0 ? (
          <Alert severity="info">No users found</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {paginatedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </Box>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Showing {paginatedUsers.length} of {users.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  size="small"
                  disabled={page === 0}
                  onClick={() => handleChangePage(null, page - 1)}
                >
                  Previous
                </Button>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', px: 1 }}>
                  Page {page + 1}
                </Typography>
                <Button
                  size="small"
                  disabled={page >= Math.ceil(users.length / rowsPerPage) - 1}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={openAddDialog || openEditDialog} onClose={() => { setOpenAddDialog(false); setOpenEditDialog(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {openAddDialog ? 'Add New User' : 'Edit User'}
            <IconButton onClick={() => { setOpenAddDialog(false); setOpenEditDialog(false); }} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {openAddDialog && (
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenAddDialog(false); setOpenEditDialog(false); }}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {openAddDialog ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

