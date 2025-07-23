import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Your Health Is Our Priority
              </Typography>
              <Typography variant="h5" paragraph>
                Experience world-class healthcare services with our team of expert doctors.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    mr: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Register
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://source.unsplash.com/random/600x400/?hospital,doctor"
                alt="Hospital"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Our Services
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          We provide a wide range of medical services to meet all your healthcare needs
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/300x200/?doctor"
                alt="General Medicine"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  General Medicine
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive care for adults including preventive care, diagnosis and treatment of chronic and acute illnesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/300x200/?cardiology"
                alt="Specialized Care"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Specialized Care
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expert care in cardiology, neurology, orthopedics, pediatrics, and other specialized fields.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/300x200/?emergency"
                alt="Emergency Services"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Emergency Services
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  24/7 emergency care with state-of-the-art facilities and experienced medical professionals.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/300x200/?health"
                alt="Preventive Care"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Preventive Care
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Regular check-ups, vaccinations, screenings, and health education to prevent illnesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          background: 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Register now to book appointments with our specialists and take the first step towards better health.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Register Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;