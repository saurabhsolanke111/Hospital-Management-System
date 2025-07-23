import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { format } from 'date-fns';
import { appointmentService } from '../services/api';
import { isPatient, isDoctor } from '../utils/auth';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isUserPatient = isPatient();
  const isUserDoctor = isDoctor();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentService.getAppointments();
        setAppointments(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      setActionLoading(true);
      
      if (isUserPatient) {
        await appointmentService.cancelAppointment(selectedAppointment.id);
      } else if (isUserDoctor) {
        await appointmentService.doctorCancelAppointment(selectedAppointment.id);
      }
      
      // Update the appointment status in the local state
      setAppointments(appointments.map(app => 
        app.id === selectedAppointment.id 
          ? { 
              ...app, 
              status: isUserPatient ? 'CANCELLED_BY_PATIENT' : 'CANCELLED_BY_DOCTOR' 
            } 
          : app
      ));
      
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError('Failed to cancel appointment. Please try again later.');
      console.error('Error cancelling appointment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(true);
      await appointmentService.completeAppointment(appointmentId);
      
      // Update the appointment status in the local state
      setAppointments(appointments.map(app => 
        app.id === appointmentId 
          ? { ...app, status: 'COMPLETED' } 
          : app
      ));
    } catch (err) {
      setError('Failed to complete appointment. Please try again later.');
      console.error('Error completing appointment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAppointments = () => {
    switch (tabValue) {
      case 0: // Upcoming
        return appointments.filter(app => app.status === 'SCHEDULED');
      case 1: // Completed
        return appointments.filter(app => app.status === 'COMPLETED');
      case 2: // Cancelled
        return appointments.filter(app => 
          app.status === 'CANCELLED_BY_PATIENT' || 
          app.status === 'CANCELLED_BY_DOCTOR'
        );
      default:
        return appointments;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'COMPLETED':
        return <Chip label="Completed" color="success" size="small" />;
      case 'CANCELLED_BY_PATIENT':
        return <Chip label="Cancelled by Patient" color="error" size="small" />;
      case 'CANCELLED_BY_DOCTOR':
        return <Chip label="Cancelled by Doctor" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>

      {appointments.length === 0 ? (
        <Alert severity="info">
          You don't have any appointments yet.
          {isUserPatient && (
            <Button
              color="primary"
              onClick={() => navigate('/doctors')}
              sx={{ ml: 2 }}
            >
              Book an Appointment
            </Button>
          )}
        </Alert>
      ) : filteredAppointments().length === 0 ? (
        <Alert severity="info">No appointments in this category.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                {isUserPatient && <TableCell>Doctor</TableCell>}
                {isUserDoctor && <TableCell>Patient</TableCell>}
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments().map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{appointment.appointmentTime}</TableCell>
                  {isUserPatient && (
                    <TableCell>
                      Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                    </TableCell>
                  )}
                  {isUserDoctor && (
                    <TableCell>
                      {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                    </TableCell>
                  )}
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>{getStatusChip(appointment.status)}</TableCell>
                  <TableCell>
                    {appointment.status === 'SCHEDULED' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(appointment)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                        {isUserDoctor && (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                            disabled={actionLoading}
                          >
                            Complete
                          </Button>
                        )}
                      </Box>
                    )}
                    {appointment.status === 'COMPLETED' && isUserDoctor && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/prescriptions/create/${appointment.id}`)}
                      >
                        Add Prescription
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            No, Keep It
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            autoFocus
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Yes, Cancel It'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments;