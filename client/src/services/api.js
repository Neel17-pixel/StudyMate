const API_BASE = '/api';

const getHeaders = () => {
  const token = sessionStorage.getItem('studymate_token') || localStorage.getItem('studymate_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem('studymate_token');
      sessionStorage.removeItem('studymate_user');
      localStorage.removeItem('studymate_token');
      localStorage.removeItem('studymate_user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw new Error(data.message || 'API Request Failed');
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse),

  demoLogin: () =>
    fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    }).then(handleResponse),

  // Subjects
  getSubjects: () =>
    fetch(`${API_BASE}/subjects`, {
      headers: getHeaders()
    }).then(handleResponse),

  createSubject: (subject) =>
    fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subject)
    }).then(handleResponse),

  updateSubject: (id, subject) =>
    fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subject)
    }).then(handleResponse),

  deleteSubject: (id) =>
    fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  createTask: (task) =>
    fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    }).then(handleResponse),

  updateTask: (id, task) =>
    fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(task)
    }).then(handleResponse),

  toggleTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    }).then(handleResponse),

  deleteTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Study Sessions
  getSessions: () =>
    fetch(`${API_BASE}/sessions`, {
      headers: getHeaders()
    }).then(handleResponse),

  createSession: (session) =>
    fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session)
    }).then(handleResponse),

  deleteSession: (id) =>
    fetch(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Notes
  getNotes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/notes${query ? `?${query}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  createNote: (note) =>
    fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(note)
    }).then(handleResponse),

  updateNote: (id, note) =>
    fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(note)
    }).then(handleResponse),

  summarizeNote: (id) =>
    fetch(`${API_BASE}/notes/${id}/summarize`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  deleteNote: (id) =>
    fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Analytics
  getDashboardStats: () =>
    fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders()
    }).then(handleResponse),

  // AI Tutor
  sendAIChat: (payload) =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getAIChatHistory: () =>
    fetch(`${API_BASE}/ai/history`, {
      headers: getHeaders()
    }).then(handleResponse),

  clearAIChatHistory: () =>
    fetch(`${API_BASE}/ai/history`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Health
  checkHealth: () =>
    fetch(`${API_BASE}/health`).then(handleResponse)
};
