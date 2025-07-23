import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Hospital Management System
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Providing quality healthcare services for over 20 years. Our mission is to deliver
              exceptional care and improve the health of our community.
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link href="/doctors" color="inherit" display="block" sx={{ mb: 1 }}>
              Doctors
            </Link>
            <Link href="/appointments" color="inherit" display="block" sx={{ mb: 1 }}>
              Appointments
            </Link>
            <Link href="/login" color="inherit" display="block" sx={{ mb: 1 }}>
              Login
            </Link>
            <Link href="/register" color="inherit" display="block">
              Register
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              123 Hospital Street, Medical District
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phone: (123) 456-7890
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: info@hospital.com
            </Typography>
            <Typography variant="body2">
              Emergency: (123) 456-7999
            </Typography>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Hospital Management System. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;