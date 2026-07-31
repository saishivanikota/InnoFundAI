import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lock, Mail, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('researcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.auth.register(username, email, password, role);
      login(data.token, data.user, null); // Automatically logs in after registration, no profile yet
      navigate('/profile'); // Redirect straight to profile creation!
    } catch (err) {
      setError(err.message || 'Registration failed. Try another username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the Research Funding & Innovation Platform</p>
        </div>

        {error && (
          <div className="auth-error-box badge-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="reg-username"
                type="text"
                className="input-field"
                placeholder="Enter unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="reg-password"
                type="password"
                className="input-field"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Account Type</label>
            <div className="input-wrapper">
              <ShieldCheck className="input-icon" size={18} />
              <select
                id="reg-role"
                className="select-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="researcher">Researcher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
