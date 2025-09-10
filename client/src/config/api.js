// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `/api/users/login`,
  REGISTER: `/api/users/register`,
  PROFILE: `/api/users/profile`,
  
  // Leaderboard
  LEADERBOARD_GLOBAL: `/api/leaderboard/global`,
  LEADERBOARD_SCHOOLS: `/api/leaderboard/schools`,
  LEADERBOARD_USER: `/api/leaderboard/user`,
  
  // Games
  GAMES_LIST: `/api/games/list`,
  GAMES_CREATE: `/api/games/create`,
  GAMES_JOIN: `/api/games/:id/join`,
  GAMES_SCORE: `/api/games/:id/score`,
  
  // Modules
  MODULES_LIST: `/api/modules`,
  MODULES_DETAIL: `/api/modules/:id`,
  MODULES_COMPLETE: `/api/modules/:id/complete`,
  
  // Alerts (use active endpoint that exists on server)
  ALERTS_CURRENT: `/api/alerts/active`,
  ALERTS_BROADCAST: `/api/alerts/broadcast`,
  
  // Admin
  ADMIN_DASHBOARD: `/api/admin/dashboard`,
  ADMIN_EXPORT: `/api/admin/export`,
  ADMIN_DRILLS_PARTICIPATION: `/api/admin/drills/participation`,
  ADMIN_DRILLS_SCHEDULE: `/api/admin/drills/schedule`,
  
  // Emergency
  EMERGENCY_CONTACTS: `/api/emergency/contacts`,
  EMERGENCY_BROADCAST: `/api/emergency/broadcast`,
  
  // Chat
  CHAT_MESSAGES: `/api/chat/messages`,
  CHAT_ROOMS: `/api/chat/rooms`,

  // Drills (VR)
  DRILLS_START: `/api/drills/start`,
  DRILLS_RESULT: `/api/drills/:id/result`,
  DRILLS_LEADERBOARD: `/api/drills/leaderboard`,
  
  // Health
  HEALTH: `/api/health`
};

// API Helper Functions
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('am_token') || localStorage.getItem('token');
  
  // Don't send token for quiz endpoints (they use optionalAuth)
  const isQuizEndpoint = url.includes('/api/quiz') && !url.includes('/submit');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && !isQuizEndpoint && { Authorization: `Bearer ${token}` })
    }
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Leaderboard
  getLeaderboard: (type = 'global') => {
    const endpoint = type === 'schools' ? API_ENDPOINTS.LEADERBOARD_SCHOOLS : API_ENDPOINTS.LEADERBOARD_GLOBAL;
    return apiRequest(endpoint);
  },
  
  // Games
  getGames: () => apiRequest(API_ENDPOINTS.GAMES_LIST),
  createGame: (gameData) => apiRequest(API_ENDPOINTS.GAMES_CREATE, {
    method: 'POST',
    body: JSON.stringify(gameData)
  }),
  joinGame: (gameId) => apiRequest(API_ENDPOINTS.GAMES_JOIN.replace(':id', gameId), {
    method: 'POST'
  }),
  submitScore: (gameId, scoreData) => apiRequest(API_ENDPOINTS.GAMES_SCORE.replace(':id', gameId), {
    method: 'POST',
    body: JSON.stringify(scoreData)
  }),
  
  // Modules
  getModules: () => apiRequest(API_ENDPOINTS.MODULES_LIST),
  getModule: (moduleId) => apiRequest(API_ENDPOINTS.MODULES_DETAIL.replace(':id', moduleId)),
  completeModule: (moduleId) => apiRequest(API_ENDPOINTS.MODULES_COMPLETE.replace(':id', moduleId), {
    method: 'POST'
  }),
  
  // Alerts
  getCurrentAlerts: () => apiRequest(API_ENDPOINTS.ALERTS_CURRENT),
  
  // Quiz
  getQuizzes: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/quiz${queryString ? `?${queryString}` : ''}`);
  },
  getQuiz: (id) => apiRequest(`/api/quiz/${id}`),
  submitQuiz: (id, answers) => apiRequest(`/api/quiz/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(answers)
  }),
  generateQuiz: (data) => apiRequest(`/api/quiz/generate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Admin
  getDashboardData: () => apiRequest(API_ENDPOINTS.ADMIN_DASHBOARD),
  exportData: (type, format = 'csv') => apiRequest(`${API_ENDPOINTS.ADMIN_EXPORT}?type=${type}&format=${format}`),
  getDrillParticipation: () => apiRequest(API_ENDPOINTS.ADMIN_DRILLS_PARTICIPATION),
  scheduleDrill: (drillData) => apiRequest(API_ENDPOINTS.ADMIN_DRILLS_SCHEDULE, {
    method: 'POST',
    body: JSON.stringify(drillData)
  }),
  
  // Health
  checkHealth: () => apiRequest(API_ENDPOINTS.HEALTH),

  // Drills
  startDrill: (payload) => apiRequest(API_ENDPOINTS.DRILLS_START, { method: 'POST', body: JSON.stringify(payload) }),
  submitDrillResult: (sessionId, payload) => apiRequest(API_ENDPOINTS.DRILLS_RESULT.replace(':id', sessionId), { method: 'POST', body: JSON.stringify(payload) }),
  getDrillsLeaderboard: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.DRILLS_LEADERBOARD}${q ? `?${q}` : ''}`);
  }
};

export default api;
