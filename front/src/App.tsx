import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

// Helper function to get cookie value
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    return part ? part.split(';').shift() : null;
  }
  return null;
};

// Helper function to check authentication
const isAuthenticated = () => {
  const token = getCookie('access_token');
  return token;
};

// Protected Route Component
import React from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated() ?
            <Navigate to="/dashboard" replace /> :
            <LandingPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;