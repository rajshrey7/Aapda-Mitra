import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Users, MessageCircle, Phone, AlertTriangle, Heart, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('ai-chat');
  const [messages, setMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const userMessagesEndRef = useRef(null);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'ai-chat' || tabParam === 'user-chat') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('am_token') || localStorage.getItem('token');
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setSocket(newSocket);
      });

      newSocket.on('userJoined', (data) => {
        setOnlineUsers(data.onlineUsers);
        if (data.user.id !== user?.id) {
          addSystemMessage(`${data.user.name} joined the chat`);
        }
      });

      newSocket.on('userLeft', (data) => {
        setOnlineUsers(data.onlineUsers);
        addSystemMessage(`${data.user.name} left the chat`);
      });

      newSocket.on('newMessage', (message) => {
        setUserMessages(prev => [...prev, message]);
      });

      newSocket.on('typing', (data) => {
        if (data.userId !== user?.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      newSocket.on('stopTyping', () => {
        setIsTyping(false);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    userMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages]);

  const addSystemMessage = (text) => {
    setUserMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      message: text,
      timestamp: new Date(),
      user: { name: 'System', avatar: '🤖' }
    }]);
  };

  const sendAIMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date(),
      user: { name: user?.name || 'You', avatar: '👤' }
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('am_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage,
          context: 'Emergency preparedness chat',
          language: 'en'
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: data.data.response,
        timestamp: new Date(),
        user: { name: 'Aapda Mitra AI', avatar: '🤖' },
        isFromKnowledgeBase: data.data.isFromKnowledgeBase
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        user: { name: 'Aapda Mitra AI', avatar: '🤖' }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendUserMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const message = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date(),
      user: { 
        id: user.id,
        name: user.name,
        avatar: user.avatar || '👤'
      }
    };

    socket.emit('sendMessage', message);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 'ai-chat') {
        sendAIMessage();
      } else {
        sendUserMessage();
      }
    }
  };

  const handleTyping = () => {
    if (socket && activeTab === 'user-chat') {
      socket.emit('typing');
      setTimeout(() => socket.emit('stopTyping'), 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { text: "What should I do during an earthquake?", icon: "🏔️" },
    { text: "How to prepare for floods?", icon: "💧" },
    { text: "Fire safety tips", icon: "🔥" },
    { text: "Emergency contacts", icon: "📞" },
    { text: "First aid basics", icon: "🏥" },
    { text: "Disaster kit checklist", icon: "🎒" }
  ];

  const handleQuickAction = (action) => {
    setNewMessage(action);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="text-blue-500" />
                Emergency Chat Hub
              </h1>
              <p className="text-gray-600 mt-2">Get help from AI and connect with other users</p>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('ai-chat')}
                className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'ai-chat' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bot size={20} />
                AI Assistant
              </button>
              <button
                onClick={() => setActiveTab('user-chat')}
                className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'user-chat' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={20} />
                Community Chat
              </button>
            </div>
          </div>

          {/* Online Users (for user chat) */}
          {activeTab === 'user-chat' && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
              </span>
              <div className="flex gap-1 ml-2">
                {onlineUsers.slice(0, 5).map((user, index) => (
                  <div key={index} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                ))}
                {onlineUsers.length > 5 && (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                    +{onlineUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {(activeTab === 'ai-chat' ? messages : userMessages).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[80%] ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {message.user.avatar}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : message.type === 'system'
                            ? 'bg-gray-100 text-gray-600 text-center'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                            {message.isFromKnowledgeBase && (
                              <span className="ml-2 text-orange-500">📚 Knowledge Base</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm">
                      🤖
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={activeTab === 'ai-chat' ? messagesEndRef : userMessagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      activeTab === 'ai-chat' 
                        ? "Ask Aapda Mitra AI about emergency preparedness..." 
                        : "Message the community..."
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isAuthenticated}
                  />
                  <button
                    onClick={activeTab === 'ai-chat' ? sendAIMessage : sendUserMessage}
                    disabled={!newMessage.trim() || !isAuthenticated}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions (AI Chat) */}
            {activeTab === 'ai-chat' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.text)}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{action.icon}</span>
                        <span className="text-sm text-gray-700">{action.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="text-red-500" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Police</span>
                  <span className="text-sm font-bold text-red-600">100</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Fire</span>
                  <span className="text-sm font-bold text-orange-600">101</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Ambulance</span>
                  <span className="text-sm font-bold text-green-600">108</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Disaster</span>
                  <span className="text-sm font-bold text-blue-600">1078</span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Safety Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Heart className="text-red-500 mt-0.5" size={16} />
                  <span>Stay calm during emergencies</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="text-red-500 mt-0.5" size={16} />
                  <span>Follow official instructions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="text-red-500 mt-0.5" size={16} />
                  <span>Keep emergency kit ready</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="text-red-500 mt-0.5" size={16} />
                  <span>Know your evacuation routes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Prompt */}
        {!isAuthenticated && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in to access the chat features and connect with other users.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

