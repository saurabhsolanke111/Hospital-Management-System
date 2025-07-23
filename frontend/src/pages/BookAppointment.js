import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { doctorService, appointmentService } from '../services/api';

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getDoctorById(id);
        setDoctor(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch doctor details. Please try again later.');
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      appointmentDate: null,
      appointmentTime: '',
      reason: '',
      notes: '',
    },
    validationSchema: Yup.object({
      appointmentDate: Yup.date()
        .required('Appointment date is required')
        .min(new Date(), 'Appointment date cannot be in the past'),
      appointmentTime: Yup.string().required('Appointment time is required'),
      reason: Yup.string().required('Reason for appointment is required'),
      notes: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        
        // Format date as ISO string (YYYY-MM-DD)
        const formattedDate = values.appointmentDate.toISOString().split('T')[0];
        
        await appointmentService.bookAppointment({
          doctorId: doctor.id,
          appointmentDate: formattedDate,
          appointmentTime: values.appointmentTime,
          consultationFees: doctor.consultationFees,
          reason: values.reason,
          notes: values.notes,
        });
        
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      } catch (err) {
        setSubmitError('Failed to book appointment. Please try again later.');
        console.error('Error booking appointment:', err);
      }
    },
  });

  const formatSpecialization = (spec) => {
    return spec?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isDateAvailable = (date) => {
    if (!doctor || !doctor.availableDays) return false;
    
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'uppercase' });
    return doctor.availableDays.includes(dayOfWeek);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/doctors')}
          sx={{ mt: 2 }}
        >
          Back to Doctors
        </Button>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info">Doctor not found.</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/doctors')}
          sx={{ mt: 2 }}
        >
          Back to Doctors
        </Button>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="success">
          Appointment booked successfully! Redirecting to your appointments...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Appointment
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box
              component="img"
              src={`https://source.unsplash.com/random/200x200/?doctor,${doctor.id}`}
              alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
              sx={{ width: '100%', borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" gutterBottom>
              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
            </Typography>
            <Chip
              label={formatSpecialization(doctor.specialization)}
              color="primary"
              sx={{ mb: 1 }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Experience:</strong> {doctor.experience} years
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Consultation Fee:</strong> ${doctor.consultationFees}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Appointment Date"
                  value={formik.values.appointmentDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('appointmentDate', newValue);
                  }}
                  shouldDisableDate={(date) => !isDateAvailable(date)}
                  disablePast
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={
                        formik.touched.appointmentDate &&
                        Boolean(formik.errors.appointmentDate)
                      }
                      helperText={
                        formik.touched.appointmentDate &&
                        formik.errors.appointmentDate
                      }
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="time-slot-label">Time Slot</InputLabel>
                <Select
                  labelId="time-slot-label"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formik.values.appointmentTime}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.appointmentTime &&
                    Boolean(formik.errors.appointmentTime)
                  }
                  label="Time Slot"
                >
                  {doctor.availableTimeSlots?.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.appointmentTime && formik.errors.appointmentTime && (
                  <Typography color="error" variant="caption">
                    {formik.errors.appointmentTime}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="reason"
                name="reason"
                label="Reason for Appointment"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Additional Notes (Optional)"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/doctors/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default BookAppointment;