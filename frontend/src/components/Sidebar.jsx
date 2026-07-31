import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  GraduationCap,
  FileText,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <GraduationCap className="logo-icon" size={32} />
        <div className="logo-text">
          <span className="logo-title">Innovation</span>
          <span className="logo-subtitle">Research Portal</span>
        </div>
      </div>

      {user && (
        <div className="sidebar-user-card">
          <div className="user-avatar">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4 className="user-name">{profile?.full_name || user.username}</h4>
            <span className="user-role">{profile?.research_domain || 'No domain configured'}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/funding" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Search size={20} />
          <span>Funding Discovery</span>
        </NavLink>

        <NavLink 
          to="/trends" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>Trend Intelligence</span>
        </NavLink>

        <NavLink 
          to="/patents" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          <span>Patent Intelligence</span>
        </NavLink>

        <NavLink 
          to="/ai" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Sparkles size={20} />
          <span>AI Assistant</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Research Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {user && (
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
