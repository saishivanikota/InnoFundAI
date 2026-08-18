// Unified API Service Layer

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.error || response.statusText || 'API Request Failed';
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
};

export const api = {
  auth: {
    login: (emailOrUsername, password) => 
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password })
      }),
    
    register: (username, email, password, role) => 
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role })
      }),
  },

  profile: {
    get: () => request('/api/profile'),
    create: (profileData) => 
      request('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      }),
    update: (profileData) => 
      request('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      }),
    delete: () => 
      request('/api/profile', {
        method: 'DELETE'
      })
  },

  funding: {
    list: (filters = {}) => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });

      const queryString = queryParams.toString();
      return request(`/api/funding${queryString ? `?${queryString}` : ''}`);
    },

    getRecommendations: () => request('/api/funding/recommendations')
  },

  trends: {
    get: () => request('/api/trends'),
    getWorks: (query = 'artificial intelligence') => request(`/api/trends/works?query=${encodeURIComponent(query)}`)
  },

  dashboard: {
    getStats: () => request('/api/dashboard/stats')
  },

  patents: {
    list: (filters = {}) => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });

      const queryString = queryParams.toString();
      return request(`/api/patents${queryString ? `?${queryString}` : ''}`);
    },
    getStats: () => request('/api/patents/stats'),
    get: (id) => request(`/api/patents/${id}`)
  },

  ai: {
    analyze: (idea) => 
      request('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ idea })
      }),
    history: () => request('/api/ai/history'),
    getScoring: () => request('/api/ai/scoring')
  }
};
export default api;
