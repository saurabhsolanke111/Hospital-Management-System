import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const bloodGroups = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
];

const Register = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE',
      dateOfBirth: new Date().toISOString().split('T')[0], // Default to today's date
      bloodGroup: 'A_POSITIVE', // Default blood group
      allergies: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      dateOfBirth: Yup.string()
        .required('Date of birth is required')
        .test('valid-date', 'Invalid date format', value => {
          if (!value) return false;
          // Check if the date is in YYYY-MM-DD format
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          if (!regex.test(value)) return false;
          
          const date = new Date(value);
          return !isNaN(date.getTime()) && date <= new Date();
        }),
      bloodGroup: Yup.string()
        .required('Blood group is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Import the auth service
        const { authService } = await import('../services/api');
        
        // Format date as YYYY-MM-DD
        const formattedDate = values.dateOfBirth;
        
        // Prepare registration data
        const registrationData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          gender: values.gender,
          dateOfBirth: formattedDate,
          bloodGroup: values.bloodGroup,
          allergies: values.allergies || '',
        };
        
        console.log('Registration data:', registrationData);
        
        // First try the debug endpoint
        try {
          console.log('Calling debug endpoint...');
          const debugResponse = await authService.debugRegister(registrationData);
          console.log('Debug response:', debugResponse);
          
          // If debug is successful, try the actual registration
          console.log('Calling register endpoint...');
          const response = await authService.register(registrationData);
          console.log('Registration response:', response);
          
          // Show success message
          setSuccess(true);
          setError('');
        } catch (apiError) {
          console.error('API error details:', apiError);
          if (apiError.response) {
            console.error('Response data:', apiError.response.data);
            console.error('Response status:', apiError.response.status);
            console.error('Response headers:', apiError.response.headers);
          }
          throw apiError;
        }
      } catch (err) {
        console.error('Registration error:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    },
  });

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            Registration successful! You can now login.
          </Alert>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="contained"
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          mb: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register as Patient
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  aria-label="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel value="MALE" control={<Radio />} label="Male" />
                  <FormControlLabel value="FEMALE" control={<Radio />} label="Female" />
                  <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="dateOfBirth"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                inputProps={{
                  max: new Date().toISOString().split('T')[0] // Prevent future dates
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                id="bloodGroup"
                label="Blood Group"
                name="bloodGroup"
                value={formik.values.bloodGroup}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bloodGroup && Boolean(formik.errors.bloodGroup)}
                helperText={formik.touched.bloodGroup && formik.errors.bloodGroup || 'Please select your blood group'}
              >
                {bloodGroups.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="allergies"
                label="Allergies (if any)"
                name="allergies"
                value={formik.values.allergies}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Register
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;