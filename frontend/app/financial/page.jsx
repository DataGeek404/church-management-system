'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/lib/api/client';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import {
  Container,
  Box,
  Paper,
  Button,
  TextField,
  MenuItem,
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

export default function FinancialManagement() {
  useRoleAccess(['admin', 'staff']);

  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'income',
    amount: '',
    category: '',
    description: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch transactions
  const { data: transactionsResponse, isLoading, error } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: () => financialApi.getTransactions({ limit: 1000 }),
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });

  // Extract transactions from nested response
  const transactions = Array.isArray(transactionsResponse?.data?.data)
    ? transactionsResponse.data.data
    : Array.isArray(transactionsResponse?.data)
      ? transactionsResponse.data
      : [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: financialApi.createTransaction,
    onSuccess: () => {
      setSuccessMessage('✅ Transaction created successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['financial-transactions']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => financialApi.updateTransaction(id, data),
    onSuccess: () => {
      setSuccessMessage('✅ Transaction updated successfully');
      setOpenForm(false);
      resetForm();
      queryClient.invalidateQueries(['financial-transactions']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: financialApi.deleteTransaction,
    onSuccess: () => {
      setSuccessMessage('✅ Transaction deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteTargetId(null);
      queryClient.invalidateQueries(['financial-transactions']);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  const resetForm = () => {
    setFormData({
      accountId: '',
      type: 'income',
      amount: '',
      category: '',
      description: '',
    });
    setEditingId(null);
  };

  const handleOpenForm = (transaction = null) => {
    if (transaction) {
      setFormData(transaction);
      setEditingId(transaction.id);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.accountId || !formData.amount || !formData.category) {
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

  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Mobile Transaction Card Component
  const TransactionCard = ({ transaction }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Chip
              label={transaction.type.toUpperCase()}
              color={transaction.type === 'income' ? 'success' : 'error'}
              size="small"
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'textSecondary' }}>
              Account: {transaction.accountId ? transaction.accountId.substring(0, 12) : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={() => handleOpenForm(transaction)}
              title="Edit"
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(transaction.id)}
              title="Delete"
              color="error"
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              color: transaction.type === 'income' ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              mb: 0.5
            }}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatKES(transaction.amount)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'textSecondary' }}>
            Category: {transaction.category || 'N/A'}
          </Typography>
        </Box>

        {transaction.description && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary' }}>
              {transaction.description.substring(0, 50)}...
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'textSecondary' }}>
          {new Date(transaction.recordedDate).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
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
            💰 Financial Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            New Transaction
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
          Manage church financial transactions and accounts
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
              Failed to load transactions
            </Alert>
          ) : transactions.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No transactions found. Create one to get started!
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Account ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.accountId || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type.toUpperCase()}
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: transaction.type === 'income' ? '#10b981' : '#ef4444',
                              fontWeight: 'bold',
                            }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatKES(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.category || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.recordedDate).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(transaction)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(transaction.id)}
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
                count={transactions.length}
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
          <Alert severity="error">Failed to load transactions</Alert>
        ) : transactions.length === 0 ? (
          <Alert severity="info">No transactions found. Create one to get started!</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {paginatedTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </Box>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Showing {paginatedTransactions.length} of {transactions.length}
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
                  disabled={page >= Math.ceil(transactions.length / rowsPerPage) - 1}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingId ? 'Edit Transaction' : 'New Transaction'}
            <IconButton onClick={handleCloseForm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Account ID"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this transaction?</Typography>
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

