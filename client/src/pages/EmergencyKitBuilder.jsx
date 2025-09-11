import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, RefreshCw, Trophy, Heart, Zap, Home, Users } from 'lucide-react';

const EmergencyKitBuilder = () => {
  const [availableItems, setAvailableItems] = useState([
    { id: '1', name: 'Water (1 gallon/person/day)', category: 'essential', reason: 'Critical for survival - 3 day minimum supply needed', icon: '💧', quantity: '3 gallons' },
    { id: '2', name: 'Non-perishable food', category: 'essential', reason: 'Energy source when regular food unavailable', icon: '🥫', quantity: '3-day supply' },
    { id: '3', name: 'First aid kit', category: 'essential', reason: 'Treat injuries when medical help is delayed', icon: '🏥' },
    { id: '4', name: 'Flashlight & batteries', category: 'essential', reason: 'Navigate safely during power outages', icon: '🔦' },
    { id: '5', name: 'Battery-powered radio', category: 'essential', reason: 'Receive emergency broadcasts and updates', icon: '📻' },
    { id: '6', name: 'Whistle', category: 'essential', reason: 'Signal for help if trapped', icon: '🎺' },
    { id: '7', name: 'Medications (7-day supply)', category: 'essential', reason: 'Maintain health when pharmacies are inaccessible', icon: '💊' },
    { id: '8', name: 'Important documents (copies)', category: 'essential', reason: 'Prove identity and ownership for aid/insurance', icon: '📄' },
    { id: '9', name: 'Cash & credit cards', category: 'essential', reason: 'ATMs may not work; small bills are best', icon: '💵' },
    { id: '10', name: 'Cell phone with chargers', category: 'essential', reason: 'Communication and emergency calls', icon: '📱' },
    { id: '11', name: 'Gaming console', category: 'unnecessary', reason: 'Entertainment is not priority in emergencies', icon: '🎮' },
    { id: '12', name: 'Jewelry collection', category: 'unnecessary', reason: 'Valuable but not practical for survival', icon: '💎' },
    { id: '13', name: 'Duct tape', category: 'useful', reason: 'Multiple uses for repairs and sealing', icon: '🔧' },
    { id: '14', name: 'Local maps', category: 'useful', reason: 'Navigate if GPS/phones fail', icon: '🗺️' },
    { id: '15', name: 'Decorative candles', category: 'unnecessary', reason: 'Fire hazard; use flashlights instead', icon: '🕯️' },
    { id: '16', name: 'Dust mask or N95', category: 'essential', reason: 'Protection from contaminated air', icon: '😷' },
    { id: '17', name: 'Plastic sheeting', category: 'useful', reason: 'Shelter-in-place seal for contaminated air', icon: '📦' },
    { id: '18', name: 'Matches (waterproof)', category: 'useful', reason: 'Fire starting for warmth and cooking', icon: '🔥' },
    { id: '19', name: 'Sleeping bag/warm blanket', category: 'essential', reason: 'Maintain body temperature if heating fails', icon: '🛏️' },
    { id: '20', name: 'Complete change of clothing', category: 'essential', reason: 'Stay dry and warm to prevent hypothermia', icon: '👕' },
  ]);

  const [kitItems, setKitItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameMode, setGameMode] = useState('learning');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (gameMode === 'challenge' && isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      handleSubmit();
    }
  }, [timeLeft, isTimerActive, gameMode]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnKit = (e) => {
    e.preventDefault();
    if (draggedItem && !kitItems.find(item => item.id === draggedItem.id)) {
      setKitItems([...kitItems, draggedItem]);
      setAvailableItems(availableItems.filter(item => item.id !== draggedItem.id));
      
      // Immediate feedback in learning mode
      if (gameMode === 'learning') {
        if (draggedItem.category === 'unnecessary') {
          setTimeout(() => {
            alert(`⚠️ ${draggedItem.name}: ${draggedItem.reason}`);
          }, 100);
        }
      }
    }
    setDraggedItem(null);
  };

  const handleDropOnAvailable = (e) => {
    e.preventDefault();
    if (draggedItem && !availableItems.find(item => item.id === draggedItem.id)) {
      setAvailableItems([...availableItems, draggedItem]);
      setKitItems(kitItems.filter(item => item.id !== draggedItem.id));
    }
    setDraggedItem(null);
  };

  const removeFromKit = (itemId) => {
    const item = kitItems.find(i => i.id === itemId);
    if (item) {
      setKitItems(kitItems.filter(i => i.id !== itemId));
      setAvailableItems([...availableItems, item]);
    }
  };

  const handleSubmit = () => {
    setAttempts(attempts + 1);
    setIsTimerActive(false);
    
    const essentialItems = kitItems.filter(item => item.category === 'essential');
    const usefulItems = kitItems.filter(item => item.category === 'useful');
    const unnecessaryItems = kitItems.filter(item => item.category === 'unnecessary');
    
    const totalEssential = availableItems.concat(kitItems).filter(item => item.category === 'essential').length;
    
    const calculatedScore = Math.round(
      (essentialItems.length / totalEssential) * 70 + 
      (usefulItems.length * 3) - 
      (unnecessaryItems.length * 10)
    );
    
    setScore(Math.max(0, Math.min(100, calculatedScore)));
    setShowFeedback(true);
  };

  const reset = () => {
    const allItems = [...availableItems, ...kitItems];
    setAvailableItems(allItems);
    setKitItems([]);
    setShowFeedback(false);
    setScore(0);
    setTimeLeft(60);
    setIsTimerActive(false);
  };

  const startChallenge = () => {
    reset();
    setGameMode('challenge');
    setIsTimerActive(true);
    setTimeLeft(60);
  };

  const getScoreMessage = () => {
    if (score >= 90) return { text: "Expert Preparedness! 🏆", color: "text-green-600" };
    if (score >= 70) return { text: "Well Prepared! ✨", color: "text-blue-600" };
    if (score >= 50) return { text: "Getting There! 💪", color: "text-yellow-600" };
    return { text: "Keep Learning! 📚", color: "text-orange-600" };
  };

  const essentialCount = kitItems.filter(item => item.category === 'essential').length;
  const totalEssentialCount = availableItems.concat(kitItems).filter(item => item.category === 'essential').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Zap className="text-yellow-500" />
                Emergency Kit Builder
              </h1>
              <p className="text-gray-600 mt-2">Drag essential items to build your emergency kit</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setGameMode('learning')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  gameMode === 'learning' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Learning Mode
              </button>
              <button
                onClick={startChallenge}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  gameMode === 'challenge' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Challenge Mode
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
              <span className="font-semibold">{essentialCount}/{totalEssentialCount} Essential</span>
            </div>
            {gameMode === 'challenge' && (
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                <Zap className="text-purple-600" size={20} />
                <span className="font-semibold">Time: {timeLeft}s</span>
              </div>
            )}
            {attempts > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Trophy className="text-blue-600" size={20} />
                <span className="font-semibold">Best Score: {score}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Items */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Home className="text-gray-600" />
              Available Items
            </h2>
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[400px] p-4 bg-gray-50 rounded-xl"
              onDragOver={handleDragOver}
              onDrop={handleDropOnAvailable}
            >
              {availableItems.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative bg-white p-3 rounded-lg cursor-move transition-all transform hover:scale-105 hover:shadow-lg border-2 ${
                    item.category === 'essential' ? 'border-green-200 hover:border-green-400' :
                    item.category === 'useful' ? 'border-blue-200 hover:border-blue-400' :
                    'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl text-center mb-1">{item.icon}</div>
                  <div className="text-xs text-center font-medium text-gray-700">{item.name}</div>
                  
                  {gameMode === 'learning' && hoveredItem === item.id && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap max-w-xs">
                      {item.reason}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Kit */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="text-red-500" />
              Your Emergency Kit
            </h2>
            <div 
              className="min-h-[400px] p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-300"
              onDragOver={handleDragOver}
              onDrop={handleDropOnKit}
            >
              {kitItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle size={48} />
                  <p className="mt-4 text-center">Drag items here to build your kit</p>
                  <p className="text-sm mt-2">Aim for all essential items!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {kitItems.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={`relative bg-white p-3 rounded-lg cursor-move transition-all hover:shadow-lg border-2 ${
                        item.category === 'essential' ? 'border-green-400' :
                        item.category === 'useful' ? 'border-blue-400' :
                        'border-red-400'
                      }`}
                    >
                      <button
                        onClick={() => removeFromKit(item.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                      <div className="text-2xl text-center mb-1">{item.icon}</div>
                      <div className="text-xs text-center font-medium text-gray-700">{item.name}</div>
                      {item.quantity && (
                        <div className="text-xs text-center text-gray-500 mt-1">{item.quantity}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={kitItems.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Check My Kit
              </button>
              <button
                onClick={reset}
                className="px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {score >= 90 ? '🏆' : score >= 70 ? '⭐' : score >= 50 ? '👍' : '📚'}
                </div>
                <h3 className={`text-3xl font-bold ${getScoreMessage().color}`}>
                  {getScoreMessage().text}
                </h3>
                <p className="text-xl mt-2">Score: {score}%</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-green-600 mb-2">✅ Essential Items in Kit:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {kitItems.filter(item => item.category === 'essential').map(item => (
                      <div key={item.id} className="text-sm bg-green-50 p-2 rounded">
                        {item.icon} {item.name}
                      </div>
                    ))}
                  </div>
                  {kitItems.filter(item => item.category === 'essential').length === 0 && (
                    <p className="text-gray-500 italic">None added</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-red-600 mb-2">❌ Missing Essential Items:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableItems.filter(item => item.category === 'essential').map(item => (
                      <div key={item.id} className="text-sm bg-red-50 p-2 rounded">
                        {item.icon} {item.name}
                        <div className="text-xs text-gray-600 mt-1">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                  {availableItems.filter(item => item.category === 'essential').length === 0 && (
                    <p className="text-green-600 font-semibold">All essential items included! 🎉</p>
                  )}
                </div>

                {kitItems.filter(item => item.category === 'unnecessary').length > 0 && (
                  <div>
                    <h4 className="font-bold text-orange-600 mb-2">⚠️ Unnecessary Items:</h4>
                    <div className="space-y-2">
                      {kitItems.filter(item => item.category === 'unnecessary').map(item => (
                        <div key={item.id} className="text-sm bg-orange-50 p-2 rounded">
                          {item.icon} {item.name}: {item.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info size={16} className="inline mr-1" />
                  <strong>Remember:</strong> A good emergency kit should sustain you for at least 72 hours. 
                  Focus on water, food, first aid, communication, and shelter essentials.
                </p>
              </div>

              <button
                onClick={() => setShowFeedback(false)}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyKitBuilder;
