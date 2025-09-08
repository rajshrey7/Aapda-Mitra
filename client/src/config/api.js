// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Leaderboard
  LEADERBOARD_GLOBAL: `${API_BASE_URL}/api/leaderboard/global`,
  LEADERBOARD_SCHOOLS: `${API_BASE_URL}/api/leaderboard/schools`,
  LEADERBOARD_USER: `${API_BASE_URL}/api/leaderboard/user`,
  
  // Games
  GAMES_LIST: `${API_BASE_URL}/api/games/list`,
  GAMES_CREATE: `${API_BASE_URL}/api/games/create`,
  GAMES_JOIN: `${API_BASE_URL}/api/games/:id/join`,
  GAMES_SCORE: `${API_BASE_URL}/api/games/:id/score`,
  
  // Modules
  MODULES_LIST: `${API_BASE_URL}/api/modules`,
  MODULES_DETAIL: `${API_BASE_URL}/api/modules/:id`,
  MODULES_COMPLETE: `${API_BASE_URL}/api/modules/:id/complete`,
  
  // Alerts (use active endpoint that exists on server)
  ALERTS_CURRENT: `${API_BASE_URL}/api/alerts/active`,
  ALERTS_BROADCAST: `${API_BASE_URL}/api/alerts/broadcast`,
  
  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_EXPORT: `${API_BASE_URL}/api/admin/export`,
  ADMIN_DRILLS_PARTICIPATION: `${API_BASE_URL}/api/admin/drills/participation`,
  ADMIN_DRILLS_SCHEDULE: `${API_BASE_URL}/api/admin/drills/schedule`,
  
  // Emergency
  EMERGENCY_CONTACTS: `${API_BASE_URL}/api/emergency/contacts`,
  EMERGENCY_BROADCAST: `${API_BASE_URL}/api/emergency/broadcast`,
  
  // Chat
  CHAT_MESSAGES: `${API_BASE_URL}/api/chat/messages`,
  CHAT_ROOMS: `${API_BASE_URL}/api/chat/rooms`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`
};

// API Helper Functions
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
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
  
  // Admin
  getDashboardData: () => apiRequest(API_ENDPOINTS.ADMIN_DASHBOARD),
  exportData: (type, format = 'csv') => apiRequest(`${API_ENDPOINTS.ADMIN_EXPORT}?type=${type}&format=${format}`),
  getDrillParticipation: () => apiRequest(API_ENDPOINTS.ADMIN_DRILLS_PARTICIPATION),
  scheduleDrill: (drillData) => apiRequest(API_ENDPOINTS.ADMIN_DRILLS_SCHEDULE, {
    method: 'POST',
    body: JSON.stringify(drillData)
  }),
  
  // Health
  checkHealth: () => apiRequest(API_ENDPOINTS.HEALTH)
};

export default api;
