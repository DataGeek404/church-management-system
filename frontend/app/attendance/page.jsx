'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/api/client';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import {
  Container,
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Typography,
  Chip,
  IconButton,
  TablePagination,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function AttendanceManagement() {
  useRoleAccess(['admin', 'staff']);

  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    memberId: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
    notes: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch attendance records
  const { data: recordsResponse, isLoading, error } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: () => attendanceApi.getRecords({ limit: 1000 }),
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });

  // Extract records from nested response
  const records = Array.isArray(recordsResponse?.data?.data)
    ? recordsResponse.data.data
    : Array.isArray(recordsResponse?.data)
      ? recordsResponse.data
      : [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: attendanceApi.recordAttendance,
    onSuccess: () => {
      setSuccessMessage('✅ Attendance record created successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['attendance-records']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => attendanceApi.updateRecord(id, data),
    onSuccess: () => {
      setSuccessMessage('✅ Attendance record updated successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['attendance-records']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: attendanceApi.deleteRecord,
    onSuccess: () => {
      setSuccessMessage('✅ Attendance record deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteTargetId(null);
      queryClient.invalidateQueries(['attendance-records']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  const resetForm = () => {
    setFormData({
      serviceId: '',
      memberId: '',
      checkInTime: '',
      checkOutTime: '',
      status: 'Present',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpenForm = (record = null) => {
    if (record) {
      setFormData({
        ...record,
        checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : '',
        checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : '',
      });
      setEditingId(record.id);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.serviceId || !formData.memberId || !formData.checkInTime) {
      setSuccessMessage('❌ Please fill in all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRecords = records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Mobile Attendance Card Component
  const AttendanceCard = ({ record }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 0.5 }}>
              Service: {record.serviceId ? record.serviceId.substring(0, 12) : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block' }}>
              Member: {record.memberId ? record.memberId.substring(0, 12) : 'N/A'}
            </Typography>
          </Box>
          <Chip
            label={record.status}
            color={record.status === 'Present' ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.65rem' }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block', mb: 0.3 }}>
            Check-In: {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block', mb: 0.3 }}>
            Check-Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not recorded'}
          </Typography>
          {record.notes && (
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary', display: 'block' }}>
              Notes: {record.notes.substring(0, 30)}...
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <IconButton
            size="small"
            onClick={() => handleOpenForm(record)}
            title="Edit"
            sx={{ fontSize: '0.75rem', p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(record.id)}
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
            📋 Attendance Management
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
            Record and manage member attendance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Record Attendance
        </Button>
      </Box>

      {successMessage && (
        <Alert
          severity={successMessage.includes('❌') ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper elevation={2}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Failed to load attendance records
            </Alert>
          ) : records.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No attendance records found. Create one to get started!
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Service ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Member ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check-In</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check-Out</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>{record.serviceId || '-'}</TableCell>
                        <TableCell>{record.memberId || '-'}</TableCell>
                        <TableCell>
                          {new Date(record.checkInTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={record.status === 'Present' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {record.notes || '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(record)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(record.id)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={records.length}
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load attendance records</Alert>
        ) : records.length === 0 ? (
          <Alert severity="info">No attendance records found. Create one to get started!</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {paginatedRecords.map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))}
            </Box>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Showing {paginatedRecords.length} of {records.length}
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
                  disabled={page >= Math.ceil(records.length / rowsPerPage) - 1}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Add/Edit Attendance Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingId ? 'Edit Attendance Record' : 'Record Attendance'}
            <IconButton onClick={handleCloseForm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Service ID"
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Member ID"
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Check-In Time"
              type="datetime-local"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Check-Out Time"
              type="datetime-local"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingId ? 'Update' : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Attendance Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record? This action cannot be undone.
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

