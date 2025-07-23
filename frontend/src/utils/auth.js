import jwt_decode from 'jwt-decode';

// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'exists' : 'not found');
  if (!token) return false;

  try {
    console.log('Decoding token...');
    const decodedToken = jwt_decode(token);
    console.log('Decoded token:', decodedToken);
    const currentTime = Date.now() / 1000;
    console.log('Current time:', currentTime, 'Token expiry:', decodedToken.exp);
    
    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      console.log('Token expired');
      localStorage.removeItem('token');
      return false;
    }
    
    console.log('Token is valid');
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

// Get current user info from token
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return jwt_decode(token);
  } catch (error) {
    return null;
  }
};

// Get user roles from token
export const getUserRoles = () => {
  const user = getCurrentUser();
  return user ? user.roles : [];
};

// Check if user has a specific role
export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('ROLE_ADMIN');
};

// Check if user is doctor
export const isDoctor = () => {
  return hasRole('ROLE_DOCTOR');
};

// Check if user is patient
export const isPatient = () => {
  return hasRole('ROLE_PATIENT');
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export default {
  isAuthenticated,
  getCurrentUser,
  getUserRoles,
  hasRole,
  isAdmin,
  isDoctor,
  isPatient,
  logout,
};