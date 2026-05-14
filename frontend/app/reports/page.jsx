'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportingApi } from '@/lib/api/client';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import { useAuth } from '@/app/context/AuthContext';
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
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function Reports() {
  useRoleAccess(['admin', 'staff']);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reportType, setReportType] = useState('membership');
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch reports
  const { data: reportsResponse, isLoading, error } = useQuery({
    queryKey: ['reports', reportType],
    queryFn: () => reportingApi.getReports({ type: reportType }),
    refetchInterval: 30000,
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: reportingApi.generateReport,
    onSuccess: (data) => {
      setSuccessMessage(`✅ Report generated successfully!`);
      queryClient.invalidateQueries(['reports', reportType]);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Failed to generate report: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Export report mutation
  const exportMutation = useMutation({
    mutationFn: ({ reportId, format }) =>
      reportingApi.exportReport(reportId, format),
    onSuccess: (data) => {
      handleExportDownload(data.data);
      setSuccessMessage(`✅ Report exported as ${selectedFormat.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Failed to export report: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: (reportId) => reportingApi.deleteReport(reportId),
    onSuccess: () => {
      setSuccessMessage(`✅ Report deleted successfully!`);
      queryClient.invalidateQueries(['reports', reportType]);
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setSuccessMessage(`❌ Failed to delete report: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      type: reportType,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    });
  };

  const handleExport = (reportId) => {
    exportMutation.mutate({ reportId, format: selectedFormat });
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setShowPreviewDialog(true);
  };

  const handleDeleteClick = (reportId) => {
    setDeleteTargetId(reportId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const handleExportDownload = (exportData) => {
    if (!exportData) return;
    const { content, filename, contentType } = exportData;
    let dataToDownload = content;
    let type = contentType;
    if (typeof content === 'object') {
      dataToDownload = JSON.stringify(content, null, 2);
      type = 'application/json';
    }
    const blob = new Blob([dataToDownload], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `report.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract reports from nested response
  const reports = Array.isArray(reportsResponse?.data?.data)
    ? reportsResponse.data.data
    : Array.isArray(reportsResponse?.data)
      ? reportsResponse.data
      : [];

  // Mobile Report Card Component
  const ReportCard = ({ report }) => (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Chip label={report.type} size="small" variant="outlined" sx={{ mb: 1 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'textSecondary' }}>
              Generated: {new Date(report.generatedAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label={report.status || 'Completed'}
            size="small"
            color={report.status === 'Completed' ? 'success' : 'warning'}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'textSecondary' }}>
            Accuracy: {report.accuracy || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => handlePreview(report)}
            sx={{ fontSize: '0.75rem', p: '0.4rem 0.8rem' }}
          >
            Preview
          </Button>
          <Button
            size="small"
            startIcon={<FileDownloadIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => handleExport(report.id)}
            disabled={exportMutation.isPending}
            sx={{ fontSize: '0.75rem', p: '0.4rem 0.8rem' }}
          >
            Export
          </Button>
          {user?.role === 'admin' && (
            <Button
              size="small"
              startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
              color="error"
              onClick={() => handleDeleteClick(report.id)}
              sx={{ fontSize: '0.75rem', p: '0.4rem 0.8rem' }}
            >
              Delete
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          📊 Reports
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
          Generate, view, and export reports for different modules
        </Typography>
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

      {/* Generate Report Section */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Generate New Report
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="membership">Membership Report</MenuItem>
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="financial">Financial Report</MenuItem>
              <MenuItem value="events">Events Report</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                py: { xs: 1, sm: 1.5 },
              }}
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              startIcon={generateMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Export Format Selection */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Export Format
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['json', 'csv', 'pdf'].map((format) => (
            <Chip
              key={format}
              label={format.toUpperCase()}
              onClick={() => setSelectedFormat(format)}
              color={selectedFormat === format ? 'primary' : 'default'}
              variant={selectedFormat === format ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper elevation={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent Reports ({reports.length})
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">Failed to load reports. Please try again.</Alert>
            ) : reports.length === 0 ? (
              <Alert severity="info">No reports generated yet. Create one to get started!</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Report Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Generated</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Accuracy</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Chip label={report.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {new Date(report.generatedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.status || 'Completed'}
                            size="small"
                            color={report.status === 'Completed' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{report.accuracy || 'N/A'}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handlePreview(report)}
                              title="Preview"
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              startIcon={<FileDownloadIcon />}
                              onClick={() => handleExport(report.id)}
                              disabled={exportMutation.isPending}
                              title={`Export as ${selectedFormat}`}
                            >
                              Export
                            </Button>
                            {user?.role === 'admin' && (
                              <Button
                                size="small"
                                startIcon={<DeleteIcon />}
                                color="error"
                                onClick={() => handleDeleteClick(report.id)}
                                title="Delete"
                              >
                                Delete
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load reports. Please try again.</Alert>
        ) : reports.length === 0 ? (
          <Alert severity="info">No reports generated yet. Create one to get started!</Alert>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.9rem' }}>
              Recent Reports ({reports.length})
            </Typography>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </Box>
        )}
      </Box>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onClose={() => setShowPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Report Preview
            <IconButton onClick={() => setShowPreviewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedReport && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Type: {selectedReport.type}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Generated: {new Date(selectedReport.generatedAt).toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Status: {selectedReport.status}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Accuracy: {selectedReport.accuracy}
              </Typography>
              <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="caption" sx={{ wordBreak: 'break-word', fontSize: '0.85rem' }}>
                  {selectedReport.content}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this report? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

