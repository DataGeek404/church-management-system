'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '@/lib/api/client';
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
  Close as CloseIcon,
} from '@mui/icons-material';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function MemberManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
  });

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: () => memberApi.getMembers({ limit: 1000 }),
  });

  const memberList = Array.isArray(members?.data?.data) ? members.data.data : [];

  const filteredMembers = memberList
    .filter((member) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || (
        `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase().includes(q) ||
        (member.email || '').toLowerCase().includes(q) ||
        (member.phone || member.phoneNumber || '').toLowerCase().includes(q)
      );

      const memberStatus = (member.status || 'active').toLowerCase();
      const matchesStatus = statusFilter === 'all' || memberStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      const aEmail = (a.email || '').toLowerCase();
      const bEmail = (b.email || '').toLowerCase();

      switch (sortBy) {
        case 'name-desc':
          return bName.localeCompare(aName);
        case 'email-asc':
          return aEmail.localeCompare(bEmail);
        case 'email-desc':
          return bEmail.localeCompare(aEmail);
        case 'name-asc':
        default:
          return aName.localeCompare(bName);
      }
    });

  // Create Member Mutation
  const createMutation = useMutation({
    mutationFn: memberApi.createMember,
    onSuccess: () => {
      showMessage('✅ Member registered successfully', 'success');
      resetForm();
      setOpenAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      refetch();
    },
    onError: (error) => {
      showMessage(`❌ Error registering member: ${error.message}`, 'error');
    },
  });

  // Update Member Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => memberApi.updateMember(id, data),
    onSuccess: () => {
      showMessage('✅ Member updated successfully', 'success');
      setOpenEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      refetch();
    },
    onError: (error) => {
      showMessage(`❌ Error updating member: ${error.message}`, 'error');
    },
  });

  // Delete Member Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => memberApi.deleteMember(id),
    onSuccess: () => {
      showMessage('✅ Member deleted successfully', 'success');
      setOpenDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      refetch();
    },
    onError: (error) => {
      showMessage(`❌ Error deleting member: ${error.message}`, 'error');
    },
  });

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      address: '',
    });
  };

  const handleAddClick = () => {
    resetForm();
    setOpenAddDialog(true);
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phoneNumber: member.phoneNumber || member.phone || '',
      dateOfBirth: member.dateOfBirth || '',
      address: member.address || '',
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  const handleSaveMember = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (openAddDialog) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: selectedMember.id, data: formData });
    }
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deleteTargetId);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedMembers = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Mobile Member Card Component
  const MemberCard = ({ member }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 0.5 }}>
              {member.firstName} {member.lastName}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block' }}>
              {member.email}
            </Typography>
          </Box>
          <Chip
            label={member.status === 'active' ? 'Active' : 'Inactive'}
            size="small"
            color={member.status === 'active' ? 'success' : 'error'}
            sx={{ fontSize: '0.65rem' }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block', mb: 0.3 }}>
            {member.phoneNumber || member.phone || 'No phone'}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block', mb: 0.3 }}>
            {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'No DOB'}
          </Typography>
          {member.address && (
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block' }}>
              {member.address.substring(0, 30)}...
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <IconButton
            size="small"
            onClick={() => { setSelectedMember(member); setShowDetailsModal(true); }}
            title="View Details"
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditClick(member)}
            title="Edit"
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(member.id)}
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            👥 Member Management
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
            Manage church members and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Register Member
        </Button>
      </Box>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                <MenuItem value="email-asc">Email (A-Z)</MenuItem>
                <MenuItem value="email-desc">Email (Z-A)</MenuItem>
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
          ) : memberList.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No members found
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date of Birth</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMembers.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>{member.phoneNumber || member.phone || '-'}</TableCell>
                        <TableCell>
                          {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.status === 'active' ? 'Active' : 'Inactive'}
                            size="small"
                            color={member.status === 'active' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedMember(member); setShowDetailsModal(true); }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(member)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(member.id)}
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
                count={filteredMembers.length}
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
        {memberList.length === 0 ? (
          <Alert severity="info">No members found</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {paginatedMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </Box>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Showing {paginatedMembers.length} of {filteredMembers.length}
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
                  disabled={page >= Math.ceil(filteredMembers.length / rowsPerPage) - 1}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Member Details Modal */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Member Details
            <IconButton onClick={() => setShowDetailsModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedMember && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Name
                </Typography>
                <Typography>{selectedMember.firstName} {selectedMember.lastName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Email
                </Typography>
                <Typography>{selectedMember.email || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Phone
                </Typography>
                <Typography>{selectedMember.phoneNumber || selectedMember.phone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Date of Birth
                </Typography>
                <Typography>
                  {selectedMember.dateOfBirth ? new Date(selectedMember.dateOfBirth).toLocaleDateString() : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Address
                </Typography>
                <Typography>{selectedMember.address || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                  Status
                </Typography>
                <Chip
                  label={selectedMember.status === 'active' ? 'Active' : 'Inactive'}
                  size="small"
                  color={selectedMember.status === 'active' ? 'success' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Member Dialog */}
      <Dialog open={openAddDialog || openEditDialog} onClose={() => { setOpenAddDialog(false); setOpenEditDialog(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {openAddDialog ? 'Register New Member' : 'Edit Member'}
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
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenAddDialog(false); setOpenEditDialog(false); }}>Cancel</Button>
          <Button
            onClick={handleSaveMember}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {openAddDialog ? 'Register' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this member? This action cannot be undone.
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

