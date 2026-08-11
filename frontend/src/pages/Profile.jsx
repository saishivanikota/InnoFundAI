import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building, 
  Tag, 
  BookOpen, 
  User, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Briefcase 
} from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  
  // Edit mode vs View mode
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [domain, setDomain] = useState('Artificial Intelligence');
  const [keywords, setKeywords] = useState('');
  const [interests, setInterests] = useState('');

  // Load existing profile values into form states
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setOrganization(profile.organization || '');
      setDomain(profile.research_domain || 'Artificial Intelligence');
      setKeywords(profile.keywords || '');
      setInterests(profile.research_interests || '');
    } else {
      setIsEditing(true); // Default to editing if no profile exists
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !organization || !domain || !keywords || !interests) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    const payload = {
      full_name: fullName,
      organization,
      research_domain: domain,
      keywords,
      research_interests: interests
    };

    try {
      let data;
      if (profile) {
        data = await api.profile.update(payload);
        setSuccessMsg('Profile updated successfully.');
      } else {
        data = await api.profile.create(payload);
        setSuccessMsg('Profile created successfully.');
      }
      updateProfile(data.profile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your research profile? This action cannot be undone.')) {
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await api.profile.delete();
      updateProfile(null);
      setFullName('');
      setOrganization('');
      setDomain('Artificial Intelligence');
      setKeywords('');
      setInterests('');
      setIsEditing(true);
      setSuccessMsg('Profile deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete profile.');
    } finally {
      setLoading(false);
    }
  };

  const domainsList = [
    'Artificial Intelligence',
    'Renewable Energy',
    'Quantum Computing',
    'Health Sciences',
    'Cybersecurity'
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="profile-layout">
        
        {/* Messages */}
        {error && (
          <div className="auth-error-box badge-danger" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-error-box badge-success" style={{ marginBottom: '1.5rem', width: '100%', color: 'var(--accent-success)' }}>
            <span>{successMsg}</span>
          </div>
        )}

        {isEditing ? (
          /* Profile Edit / Creation Form */
          <div className="glass-panel profile-form-card">
            <div className="form-card-header">
              <h2>{profile ? 'Edit Research Profile' : 'Create Research Profile'}</h2>
              <p>Configure your details to receive matching funding recommendations</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="p-name">Full Name (including titles)</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      id="p-name"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="p-org">Affiliated Organization</label>
                  <div className="input-wrapper">
                    <Building className="input-icon" size={18} />
                    <input
                      id="p-org"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Tech University"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="p-domain">Research Domain</label>
                  <div className="input-wrapper">
                    <Briefcase className="input-icon" size={18} />
                    <select
                      id="p-domain"
                      className="select-field"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                    >
                      {domainsList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="p-tags">Keywords (comma-separated)</label>
                  <div className="input-wrapper">
                    <Tag className="input-icon" size={18} />
                    <input
                      id="p-tags"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Machine Learning, Computer Vision, AI"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="p-interests">Research Interests Summary</label>
                <div className="input-wrapper">
                  <BookOpen className="input-icon" size={18} style={{ alignSelf: 'flex-start', marginTop: '0.8rem' }} />
                  <textarea
                    id="p-interests"
                    className="textarea-field"
                    placeholder="Provide a detailed description of your current research focuses, goals, and methodologies..."
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                {profile && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{profile ? 'Save Changes' : 'Create Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Profile Details View Mode */
          <div className="profile-view-layout">
            <div className="glass-panel profile-details-card">
              <div className="profile-header-badge">
                <div className="profile-avatar-large">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-intro">
                  <h2>{profile.full_name}</h2>
                  <p className="profile-org-text">
                    <Building size={16} />
                    <span>{profile.organization}</span>
                  </p>
                  <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>
                    {profile.research_domain}
                  </span>
                </div>
                
                <div className="profile-view-actions">
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    <Trash2 size={16} />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>

              <hr className="profile-divider" />

              <div className="profile-body-section">
                <h3>Keywords</h3>
                <div className="keyword-tags-container">
                  {profile.keywords.split(',').map((tag, idx) => (
                    <span key={idx} className="keyword-tag">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-body-section">
                <h3>Research Summary & Focus Interests</h3>
                <div className="profile-interests-box">
                  <p>{profile.research_interests}</p>
                </div>
              </div>
            </div>

            {/* Quick Context Card */}
            <div className="glass-panel profile-tip-card">
              <h3>System Matcher Active</h3>
              <p style={{ marginTop: '0.75rem' }}>
                Your research domain is set to <strong>{profile.research_domain}</strong>.
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                The discovery agent is running matches in the database. Head over to <strong>Funding Discovery</strong> to view recommended opportunities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
