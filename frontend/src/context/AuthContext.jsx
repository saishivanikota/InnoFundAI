import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Retrieve session on app mount or token change
  useEffect(() => {
    const loadSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setProfile(data.profile);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (error) {
        console.error('Session loading failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [token]);

  const handleLogin = (newToken, newUser, newProfile) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      loading,
      login: handleLogin,
      logout: handleLogout,
      updateProfile: handleUpdateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
