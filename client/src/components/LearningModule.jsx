import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiChevronLeft, FiChevronRight, FiX, FiDownload, FiRotateCcw, FiStar, FiShield, FiAlertTriangle, FiZap, FiCloudRain, FiSun } from 'react-icons/fi';

const LearningModule = ({ isOpen, onClose, moduleType }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);

  const moduleData = {
    earthquake: {
      title: "Learn About Earthquakes",
      subtitle: "Stay safe, stay smart!",
      color: "from-amber-500 to-orange-600",
      icon: "🌍",
      pages: [
        {
          type: "cover",
          content: {
            title: "Learn About Earthquakes",
            subtitle: "Stay safe, stay smart!",
            icon: "🌍",
            description: "Discover how earthquakes happen and how to stay safe!"
          }
        },
        {
          type: "intro",
          content: {
            title: "What is an Earthquake?",
            text: "An earthquake is when the ground shakes! It happens when big pieces of Earth's crust move and bump into each other.",
            icon: "🌍"
          }
        },
        {
          type: "objectives",
          content: {
            title: "What You'll Learn",
            objectives: [
              "🌍 How earthquakes happen",
              "🏠 How to make your home safer",
              "🚨 What to do during an earthquake",
              "📱 How to get emergency alerts",
              "🆘 How to help others safely",
              "📚 Where to find more information"
            ]
          }
        },
        {
          type: "content",
          content: {
            title: "How Earthquakes Happen",
            text: "The Earth's surface is made of huge pieces called tectonic plates. When these plates move, they can cause earthquakes. The shaking happens when energy is released from deep underground.",
            image: "[Insert Placeholder: Diagram of tectonic plates]",
            keyTerms: ["Tectonic Plates", "Seismic Waves", "Epicenter"]
          }
        },
        {
          type: "content",
          content: {
            title: "Safety Tips",
            text: "When you feel the ground shaking: Drop, Cover, and Hold On! Find a sturdy table or desk and hold on tight until the shaking stops.",
            image: "[Insert Placeholder: Safety diagram]",
            keyTerms: ["Drop, Cover, Hold On", "Sturdy Furniture", "Stay Indoors"]
          }
        },
        {
          type: "story",
          content: {
            title: "The Great Earthquake of 1906",
            text: "In 1906, a huge earthquake hit San Francisco. It was so strong that buildings fell down and fires started everywhere. But people helped each other and rebuilt the city!",
            timeline: ["April 18, 1906", "5:12 AM", "Magnitude 7.9", "3,000+ deaths", "City rebuilt"]
          }
        },
        {
          type: "activity",
          content: {
            title: "What Would You Do?",
            question: "You're in your classroom when an earthquake starts. What should you do?",
            options: [
              "Run outside quickly",
              "Drop, cover, and hold on under your desk",
              "Stand in the doorway",
              "Go to the window"
            ],
            correct: 1,
            explanation: "The safest thing is to drop, cover, and hold on under a sturdy desk or table!"
          }
        },
        {
          type: "summary",
          content: {
            title: "Key Safety Tips",
            tips: [
              "🌍 Earthquakes happen when tectonic plates move",
              "🏠 Drop, Cover, and Hold On during shaking",
              "📱 Sign up for emergency alerts",
              "🆘 Help others after the shaking stops",
              "📚 Learn more about earthquake safety"
            ]
          }
        },
        {
          type: "certificate",
          content: {
            title: "Congratulations!",
            subtitle: "You are an Earthquake Safety Hero!",
            message: "You've learned how to stay safe during earthquakes. Share your knowledge with family and friends!"
          }
        }
      ]
    },
    fire: {
      title: "Learn About Fire Safety",
      subtitle: "Stay safe, stay smart!",
      color: "from-red-500 to-orange-600",
      icon: "🔥",
      pages: [
        {
          type: "cover",
          content: {
            title: "Learn About Fire Safety",
            subtitle: "Stay safe, stay smart!",
            icon: "🔥",
            description: "Discover how fires start and how to prevent them!"
          }
        },
        {
          type: "intro",
          content: {
            title: "What is Fire?",
            text: "Fire is a chemical reaction that produces heat and light. It needs three things: fuel, oxygen, and heat. We call this the Fire Triangle!",
            icon: "🔥"
          }
        },
        {
          type: "objectives",
          content: {
            title: "What You'll Learn",
            objectives: [
              "🔥 How fires start and spread",
              "🚫 How to prevent fires at home",
              "🚨 What to do if there's a fire",
              "📞 How to call emergency services",
              "🆘 How to help others safely",
              "📚 Fire safety rules to remember"
            ]
          }
        },
        {
          type: "content",
          content: {
            title: "The Fire Triangle",
            text: "Fire needs three things to burn: Fuel (something to burn), Oxygen (air), and Heat (spark or flame). Remove any one of these, and the fire goes out!",
            image: "[Insert Placeholder: Fire Triangle diagram]",
            keyTerms: ["Fire Triangle", "Fuel", "Oxygen", "Heat"]
          }
        },
        {
          type: "content",
          content: {
            title: "Fire Prevention",
            text: "Never play with matches, lighters, or candles. Keep flammable things away from heat sources. Always have working smoke detectors in your home!",
            image: "[Insert Placeholder: Fire prevention tips]",
            keyTerms: ["Smoke Detectors", "Fire Extinguisher", "Escape Plan"]
          }
        },
        {
          type: "story",
          content: {
            title: "The Great Fire of London",
            text: "In 1666, a small fire in a bakery grew into a huge fire that burned for 4 days! It destroyed most of London, but people learned important lessons about fire safety.",
            timeline: ["September 2, 1666", "Pudding Lane Bakery", "4 days of burning", "13,000+ houses destroyed", "New fire safety laws"]
          }
        },
        {
          type: "activity",
          content: {
            title: "Fire Safety Quiz",
            question: "What should you do if your clothes catch fire?",
            options: [
              "Run around to put it out",
              "Stop, Drop, and Roll",
              "Jump up and down",
              "Blow on the flames"
            ],
            correct: 1,
            explanation: "Stop, Drop, and Roll is the safest way to put out flames on your clothes!"
          }
        },
        {
          type: "summary",
          content: {
            title: "Key Safety Tips",
            tips: [
              "🔥 Fire needs fuel, oxygen, and heat",
              "🚫 Never play with matches or lighters",
              "🚨 Stop, Drop, and Roll if clothes catch fire",
              "📞 Call 911 for help",
              "🏠 Have a family escape plan"
            ]
          }
        },
        {
          type: "certificate",
          content: {
            title: "Congratulations!",
            subtitle: "You are a Fire Safety Hero!",
            message: "You've learned how to prevent fires and stay safe. Share your knowledge with family and friends!"
          }
        }
      ]
    },
    thunderstorm: {
      title: "Learn About Thunderstorms",
      subtitle: "Stay safe, stay smart!",
      color: "from-blue-500 to-purple-600",
      icon: "⛈️",
      pages: [
        {
          type: "cover",
          content: {
            title: "Learn About Thunderstorms",
            subtitle: "Stay safe, stay smart!",
            icon: "⛈️",
            description: "Discover how thunderstorms form and how to stay safe!"
          }
        },
        {
          type: "intro",
          content: {
            title: "What is a Thunderstorm?",
            text: "A thunderstorm is a storm with thunder and lightning! It happens when warm, moist air rises quickly and meets cold air high in the sky.",
            icon: "⛈️"
          }
        },
        {
          type: "objectives",
          content: {
            title: "What You'll Learn",
            objectives: [
              "⛈️ How thunderstorms form",
              "⚡ Why lightning happens",
              "🌧️ What causes thunder",
              "🏠 How to stay safe indoors",
              "🚗 What to do if caught outside",
              "📱 How to track storms"
            ]
          }
        },
        {
          type: "content",
          content: {
            title: "Lightning and Thunder",
            text: "Lightning is electricity in the sky! When it happens, it heats the air so fast that it makes a loud sound called thunder. Light travels faster than sound, so we see lightning before we hear thunder.",
            image: "[Insert Placeholder: Lightning formation diagram]",
            keyTerms: ["Lightning", "Thunder", "Electricity", "Sound Waves"]
          }
        },
        {
          type: "content",
          content: {
            title: "Storm Safety",
            text: "When you hear thunder, go indoors immediately! Stay away from windows, don't use electronics, and avoid water. If you're outside, find a low spot and crouch down.",
            image: "[Insert Placeholder: Storm safety tips]",
            keyTerms: ["Indoor Safety", "Lightning Rod", "Storm Shelter"]
          }
        },
        {
          type: "story",
          content: {
            title: "The Great Storm of 1987",
            text: "In 1987, a huge storm hit England with winds over 100 mph! It knocked down millions of trees and caused lots of damage, but people helped each other clean up.",
            timeline: ["October 15, 1987", "100+ mph winds", "15 million trees down", "18 deaths", "Community cleanup"]
          }
        },
        {
          type: "activity",
          content: {
            title: "Storm Safety Quiz",
            question: "What should you do if you're outside during a thunderstorm?",
            options: [
              "Stand under a tall tree",
              "Find a low spot and crouch down",
              "Run to the nearest building",
              "Lie flat on the ground"
            ],
            correct: 1,
            explanation: "Find a low spot and crouch down to avoid being the tallest object around!"
          }
        },
        {
          type: "summary",
          content: {
            title: "Key Safety Tips",
            tips: [
              "⛈️ Thunderstorms have lightning and thunder",
              "🏠 Go indoors when you hear thunder",
              "⚡ Stay away from windows and electronics",
              "🌧️ Avoid water during storms",
              "📱 Use weather apps to track storms"
            ]
          }
        },
        {
          type: "certificate",
          content: {
            title: "Congratulations!",
            subtitle: "You are a Thunderstorm Safety Hero!",
            message: "You've learned how to stay safe during thunderstorms. Share your knowledge with family and friends!"
          }
        }
      ]
    },
    heatwave: {
      title: "Learn About Heatwaves",
      subtitle: "Stay safe, stay smart!",
      color: "from-yellow-500 to-orange-600",
      icon: "☀️",
      pages: [
        {
          type: "cover",
          content: {
            title: "Learn About Heatwaves",
            subtitle: "Stay safe, stay smart!",
            icon: "☀️",
            description: "Discover how heatwaves happen and how to stay cool!"
          }
        },
        {
          type: "intro",
          content: {
            title: "What is a Heatwave?",
            text: "A heatwave is when it's much hotter than normal for several days in a row. It can be dangerous if we don't stay cool and drink lots of water!",
            icon: "☀️"
          }
        },
        {
          type: "objectives",
          content: {
            title: "What You'll Learn",
            objectives: [
              "☀️ What causes heatwaves",
              "🌡️ How heat affects our bodies",
              "💧 Why water is so important",
              "🏠 How to stay cool indoors",
              "👕 What clothes to wear",
              "🆘 How to help others"
            ]
          }
        },
        {
          type: "content",
          content: {
            title: "Heat and Your Body",
            text: "When it's very hot, our bodies work hard to stay cool by sweating. But if it's too hot, we can get sick. That's why we need to drink water and stay in cool places!",
            image: "[Insert Placeholder: Body temperature regulation]",
            keyTerms: ["Sweating", "Dehydration", "Heat Stroke", "Body Temperature"]
          }
        },
        {
          type: "content",
          content: {
            title: "Staying Cool",
            text: "Wear light, loose clothes in light colors. Stay indoors during the hottest part of the day. Drink lots of water and eat cool foods like fruits and vegetables!",
            image: "[Insert Placeholder: Heat safety tips]",
            keyTerms: ["Hydration", "Shade", "Cool Clothing", "Water Intake"]
          }
        },
        {
          type: "story",
          content: {
            title: "The European Heatwave of 2003",
            text: "In 2003, Europe had its hottest summer in 500 years! Many people got sick from the heat, but communities came together to help each other stay cool.",
            timeline: ["Summer 2003", "Hottest in 500 years", "70,000+ deaths", "Community help", "Better heat plans"]
          }
        },
        {
          type: "activity",
          content: {
            title: "Heat Safety Quiz",
            question: "What should you do if someone is feeling dizzy from the heat?",
            options: [
              "Give them hot tea",
              "Move them to a cool place and give water",
              "Make them exercise",
              "Put them in the sun"
            ],
            correct: 1,
            explanation: "Move them to a cool place and give them water to help them cool down!"
          }
        },
        {
          type: "summary",
          content: {
            title: "Key Safety Tips",
            tips: [
              "☀️ Heatwaves are very hot weather",
              "💧 Drink lots of water",
              "🏠 Stay indoors during hottest hours",
              "👕 Wear light, loose clothes",
              "🆘 Help others who might be struggling"
            ]
          }
        },
        {
          type: "certificate",
          content: {
            title: "Congratulations!",
            subtitle: "You are a Heatwave Safety Hero!",
            message: "You've learned how to stay safe during heatwaves. Share your knowledge with family and friends!"
          }
        }
      ]
    }
  };

  const currentModule = moduleData[moduleType] || moduleData.earthquake;
  const currentPageData = currentModule.pages[currentPage];

  const nextPage = () => {
    if (currentPage < currentModule.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setCompleted(true);
      setShowCertificate(true);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startModule = () => {
    setIsBookOpen(true);
    setCurrentPage(1);
  };

  const restartModule = () => {
    setCurrentPage(0);
    setCompleted(false);
    setShowCertificate(false);
    setAnswers({});
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const downloadCertificate = () => {
    // In a real app, this would generate and download a PDF certificate
    alert("Certificate downloaded! (This is a demo)");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${currentModule.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {currentModule.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{currentModule.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentModule.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isBookOpen ? (
              <motion.div
                key="cover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`w-32 h-32 bg-gradient-to-r ${currentModule.color} rounded-full flex items-center justify-center text-6xl mb-8 shadow-lg`}
                >
                  {currentModule.icon}
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {currentModule.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  {currentModule.subtitle}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startModule}
                  className={`px-8 py-4 bg-gradient-to-r ${currentModule.color} text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all`}
                >
                  <FiBook className="inline mr-2" />
                  Start Learning
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="book"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {currentPageData.type === "cover" && (
                    <div className="text-center">
                      <div className={`w-24 h-24 bg-gradient-to-r ${currentModule.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-6`}>
                        {currentPageData.content.icon}
                      </div>
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                        {currentPageData.content.subtitle}
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-500">
                        {currentPageData.content.description}
                      </p>
                    </div>
                  )}

                  {currentPageData.type === "intro" && (
                    <div className="text-center">
                      <div className={`w-20 h-20 bg-gradient-to-r ${currentModule.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-6`}>
                        {currentPageData.content.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {currentPageData.content.text}
                      </p>
                    </div>
                  )}

                  {currentPageData.type === "objectives" && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
                        {currentPageData.content.title}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentPageData.content.objectives.map((objective, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <span className="text-2xl">{objective.split(' ')[0]}</span>
                            <span className="text-gray-700 dark:text-gray-300">{objective.substring(objective.indexOf(' ') + 1)}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPageData.type === "content" && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {currentPageData.content.text}
                      </p>
                      {currentPageData.content.image && (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center mb-6">
                          <p className="text-gray-500 dark:text-gray-400 italic">
                            {currentPageData.content.image}
                          </p>
                        </div>
                      )}
                      {currentPageData.content.keyTerms && (
                        <div className="flex flex-wrap gap-2">
                          {currentPageData.content.keyTerms.map((term, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentPageData.type === "story" && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {currentPageData.content.text}
                      </p>
                      {currentPageData.content.timeline && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Timeline</h3>
                          <div className="space-y-2">
                            {currentPageData.content.timeline.map((event, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className={`w-2 h-2 bg-gradient-to-r ${currentModule.color} rounded-full`}></div>
                                <span className="text-gray-700 dark:text-gray-300">{event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentPageData.type === "activity" && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        {currentPageData.content.question}
                      </p>
                      <div className="space-y-3">
                        {currentPageData.content.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswer(currentPage, index)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                              answers[currentPage] === index
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {answers[currentPage] !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-4 p-4 rounded-lg ${
                            answers[currentPage] === currentPageData.content.correct
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <p className={`font-medium ${
                            answers[currentPage] === currentPageData.content.correct
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-red-800 dark:text-red-200'
                          }`}>
                            {answers[currentPage] === currentPageData.content.correct ? '✅ Correct!' : '❌ Not quite right.'}
                          </p>
                          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                            {currentPageData.content.explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {currentPageData.type === "summary" && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
                        {currentPageData.content.title}
                      </h2>
                      <div className="space-y-4">
                        {currentPageData.content.tips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <span className="text-2xl">{tip.split(' ')[0]}</span>
                            <span className="text-gray-700 dark:text-gray-300">{tip.substring(tip.indexOf(' ') + 1)}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPageData.type === "certificate" && (
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`w-32 h-32 bg-gradient-to-r ${currentModule.color} rounded-full flex items-center justify-center text-6xl mx-auto mb-8 shadow-lg`}
                      >
                        <FiStar className="text-white" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {currentPageData.content.title}
                      </h2>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                        {currentPageData.content.subtitle}
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-500 mb-8">
                        {currentPageData.content.message}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={downloadCertificate}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <FiDownload className="w-5 h-5" />
                          <span>Download Certificate</span>
                        </button>
                        <button
                          onClick={restartModule}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <FiRotateCcw className="w-5 h-5" />
                          <span>Restart Module</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {currentModule.pages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentPage
                            ? `bg-gradient-to-r ${currentModule.color}`
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === currentModule.pages.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{currentPage === currentModule.pages.length - 1 ? 'Finish' : 'Next'}</span>
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningModule;
