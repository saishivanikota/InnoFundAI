import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Funding from './pages/Funding';
import Trends from './pages/Trends';
import Patents from './pages/Patents';
import AI from './pages/AI';
import { ToastProvider } from './context/ToastContext';

// Protected Route component wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <h2>Loading user session...</h2>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const MainAppLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {/* Sidebar is visible to all authenticated users; for guests, they can still navigate the public sections */}
      <Sidebar />
      
      <main className="main-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/patents" element={<Patents />} />
          
          <Route 
            path="/ai" 
            element={
              <ProtectedRoute>
                <AI />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <MainAppLayout />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
