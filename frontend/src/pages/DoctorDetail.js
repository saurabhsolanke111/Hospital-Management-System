import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  School,
  Star,
  AttachMoney,
  Description,
} from '@mui/icons-material';
import { doctorService } from '../services/api';
import { isAuthenticated } from '../utils/auth';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatSpecialization = (spec) => {
    return spec?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleBookAppointment = () => {
    if (isAuthenticated()) {
      navigate(`/book-appointment/${id}`);
    } else {
      navigate('/login', { state: { from: `/doctors/${id}` } });
    }
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

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/doctors')}
        sx={{ mb: 4 }}
      >
        Back to Doctors
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={`https://source.unsplash.com/random/400x300/?doctor,${doctor.id}`}
              alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                Dr. {doctor.user?.firstName} {doctor.user?.lastName}
              </Typography>
              <Chip
                label={formatSpecialization(doctor.specialization)}
                color="primary"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBookAppointment}
                sx={{ mt: 2 }}
              >
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Doctor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText
                  primary="Education"
                  secondary={doctor.education}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Star />
                </ListItemIcon>
                <ListItemText
                  primary="Experience"
                  secondary={`${doctor.experience} years`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney />
                </ListItemIcon>
                <ListItemText
                  primary="Consultation Fee"
                  secondary={`$${doctor.consultationFees}`}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonth sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Available Days</Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  {doctor.availableDays?.map((day) => (
                    <Chip
                      key={day}
                      label={day.charAt(0) + day.slice(1).toLowerCase()}
                      sx={{ m: 0.5 }}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Time Slots</Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  {doctor.availableTimeSlots?.map((slot) => (
                    <Chip key={slot} label={slot} sx={{ m: 0.5 }} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {doctor.biography && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                About Doctor
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Description sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body1">{doctor.biography}</Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDetail;