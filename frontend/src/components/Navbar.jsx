import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview Dashboard';
      case '/funding':
        return 'Funding Discovery';
      case '/trends':
        return 'Trend Intelligence';
      case '/profile':
        return 'Research Profile';
      case '/login':
        return 'Account Login';
      case '/register':
        return 'Account Registration';
      default:
        return 'InnoFund Platform';
    }
  };

  const getGreeting = () => {
    if (profile?.full_name) {
      return `Welcome, ${profile.full_name}`;
    }
    if (user?.username) {
      return `Hello, ${user.username}`;
    }
    return 'Guest User';
  };

  const formatDate = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle()}</h1>
        <p className="navbar-greeting">{getGreeting()}</p>
      </div>

      <div className="navbar-right">
        <div className="navbar-date">
          <Calendar size={16} />
          <span>{formatDate()}</span>
        </div>

        {user ? (
          <div className="navbar-badge-container">
            {user.role === 'admin' && (
              <span className="admin-badge">
                <ShieldAlert size={14} />
                <span>Admin</span>
              </span>
            )}
            <div className="profile-indicator">
              <User size={18} />
              <span>{user.username}</span>
            </div>
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
