'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '@/lib/api/client';
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
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function CommunicationManagement() {
  useRoleAccess(['admin', 'staff']);

  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    body: '',
    type: 'notification',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch messages
  const { data: messagesResponse, isLoading, error } = useQuery({
    queryKey: ['communication-messages'],
    queryFn: () => communicationApi.getMessages({ limit: 1000 }),
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });

  // Extract messages from nested response
  const messages = Array.isArray(messagesResponse?.data?.data)
    ? messagesResponse.data.data
    : Array.isArray(messagesResponse?.data)
      ? messagesResponse.data
      : [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: communicationApi.sendMessages,
    onSuccess: () => {
      setSuccessMessage('✅ Message sent successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['communication-messages']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => communicationApi.updateMessage(id, data),
    onSuccess: () => {
      setSuccessMessage('✅ Message updated successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['communication-messages']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: communicationApi.deleteMessage,
    onSuccess: () => {
      setSuccessMessage('✅ Message deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteTargetId(null);
      queryClient.invalidateQueries(['communication-messages']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  const resetForm = () => {
    setFormData({
      recipientId: '',
      subject: '',
      body: '',
      type: 'notification',
    });
    setEditingId(null);
  };

  const handleOpenForm = (message = null) => {
    if (message) {
      setFormData(message);
      setEditingId(message.id);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.recipientId || !formData.subject || !formData.body) {
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

  const paginatedMessages = messages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Mobile view - Card layout
  const MobileMessageCard = ({ message }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1, wordBreak: 'break-word' }}>
            {message.recipientId ? message.recipientId.substring(0, 16) : 'N/A'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={() => handleOpenForm(message)}
              title="Edit"
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(message.id)}
              title="Delete"
              color="error"
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            {message.subject ? message.subject.substring(0, 40) : 'No Subject'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label={message.type}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
          <Chip
            label={message.status}
            color={message.status === 'Sent' ? 'success' : 'warning'}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
        </Box>

        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary' }}>
          {new Date(message.sentTime).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 1
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            💬 Communications
          </Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Send Message
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
          Manage messages and notifications to community members
        </Typography>
      </Box>

      {/* Alert Messages */}
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
              Failed to load messages
            </Alert>
          ) : messages.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No messages found. Send one to get started!
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Recipient ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Sent Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMessages.map((message) => (
                      <TableRow key={message.id} hover>
                        <TableCell>{message.recipientId || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {message.subject || '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={message.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={message.status}
                            color={message.status === 'Sent' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(message.sentTime).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(message)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(message.id)}
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
                count={messages.length}
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
          <Alert severity="error">Failed to load messages</Alert>
        ) : messages.length === 0 ? (
          <Alert severity="info">No messages found. Send one to get started!</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {paginatedMessages.map((message) => (
                <MobileMessageCard key={message.id} message={message} />
              ))}
            </Box>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Showing {paginatedMessages.length} of {messages.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', overflow: 'auto' }}>
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
                  disabled={page >= Math.ceil(messages.length / rowsPerPage) - 1}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Send/Edit Message Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingId ? 'Edit Message' : 'Send Message'}
            <IconButton onClick={handleCloseForm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Recipient ID"
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              required
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="notification">Notification</option>
              <option value="message">Message</option>
              <option value="alert">Alert</option>
              <option value="reminder">Reminder</option>
            </TextField>
            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Body"
              multiline
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
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
            {editingId ? 'Update' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
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

