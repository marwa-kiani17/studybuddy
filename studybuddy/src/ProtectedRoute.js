import React from 'react';
import { Navigate } from 'react-router-dom';

// Mocked authentication check. Replace with real authentication logic.
const isAuthenticated = () => {
  // Check if the user is authenticated (you can replace this logic with your actual authentication check)
  return !!localStorage.getItem('authToken'); // Assuming you're storing an auth token in local storage
};

const ProtectedRoute = ({ children }) => {
  // If the user is authenticated, render the children (protected component)
  // If not, redirect to the login page
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
