import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { doctorService } from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialization, setSpecialization] = useState('');

  const specializations = [
    { value: '', label: 'All Specializations' },
    { value: 'GENERAL_MEDICINE', label: 'General Medicine' },
    { value: 'CARDIOLOGY', label: 'Cardiology' },
    { value: 'DERMATOLOGY', label: 'Dermatology' },
    { value: 'ENDOCRINOLOGY', label: 'Endocrinology' },
    { value: 'GASTROENTEROLOGY', label: 'Gastroenterology' },
    { value: 'NEUROLOGY', label: 'Neurology' },
    { value: 'OBSTETRICS_GYNECOLOGY', label: 'Obstetrics & Gynecology' },
    { value: 'OPHTHALMOLOGY', label: 'Ophthalmology' },
    { value: 'ORTHOPEDICS', label: 'Orthopedics' },
    { value: 'PEDIATRICS', label: 'Pediatrics' },
    { value: 'PSYCHIATRY', label: 'Psychiatry' },
    { value: 'PULMONOLOGY', label: 'Pulmonology' },
    { value: 'RADIOLOGY', label: 'Radiology' },
    { value: 'UROLOGY', label: 'Urology' },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        let response;
        
        if (specialization) {
          response = await doctorService.getDoctorsBySpecialization(specialization);
        } else {
          response = await doctorService.getAllDoctors();
        }
        
        setDoctors(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialization]);

  const handleSpecializationChange = (event) => {
    setSpecialization(event.target.value);
  };

  const formatSpecialization = (spec) => {
    return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Doctors
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth sx={{ maxWidth: 300, mx: 'auto' }}>
          <InputLabel id="specialization-label">Filter by Specialization</InputLabel>
          <Select
            labelId="specialization-label"
            id="specialization"
            value={specialization}
            label="Filter by Specialization"
            onChange={handleSpecializationChange}
          >
            {specializations.map((spec) => (
              <MenuItem key={spec.value} value={spec.value}>
                {spec.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {doctors.length === 0 && !loading && !error ? (
        <Alert severity="info">
          No doctors found. Please try a different specialization.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {doctors.map((doctor) => (
            <Grid item key={doctor.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://source.unsplash.com/random/300x200/?doctor,${doctor.id}`}
                  alt={`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </Typography>
                  <Chip 
                    label={formatSpecialization(doctor.specialization)} 
                    color="primary" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Experience:</strong> {doctor.experience} years
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Education:</strong> {doctor.education}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Consultation Fee:</strong> ${doctor.consultationFees}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    component={RouterLink} 
                    to={`/doctors/${doctor.id}`}
                    fullWidth
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Doctors;