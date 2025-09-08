// client/src/utils/gameSocket.js
// Socket.IO utilities for real-time game communication

import { io } from 'socket.io-client';

class GameSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (apiUrl ? apiUrl.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    // Connect to default namespace at server origin (no /api)
    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to game server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from game server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.socket?.connect();
        }, 2000 * this.reconnectAttempts);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Game session methods
  createSession(sessionData) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('createSession', sessionData);
  }

  joinSession(sessionId) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('joinSession', { sessionId });
  }

  leaveSession(sessionId) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('leaveSession', { sessionId });
  }

  startSession(sessionId) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('startSession', { sessionId });
  }

  submitScore(sessionId, score, gameData) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('playerScore', { sessionId, score, gameData });
  }

  // Chat methods
  joinRoom(roomId) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('joinRoom', roomId);
  }

  leaveRoom(roomId) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('leaveRoom', roomId);
  }

  sendMessage(roomId, message, type = 'text') {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('chat:message', { roomId, message, type });
  }

  // Admin methods
  sendBroadcast(broadcastData) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('admin:broadcast', broadcastData);
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Utility methods
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const gameSocketService = new GameSocketService();

// Factory functions
export const createRealtimeSocket = (token) => {
  return gameSocketService.connect(token);
};

export const createGameSocket = (token) => {
  return gameSocketService.connect(token);
};

// Export the service instance
export default gameSocketService;

// Helper function to get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('am_token');
};

// Helper function to connect with stored token
export const connectWithStoredToken = () => {
  const token = getAuthToken();
  if (token) {
    return createRealtimeSocket(token);
  }
  throw new Error('No authentication token found');
};
