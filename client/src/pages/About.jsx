import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-center">About Aapda Mitra</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">
            Aapda Mitra aims to revolutionize disaster preparedness education in schools across Punjab 
            and India through gamified learning, making safety education engaging and effective.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Smart India Hackathon 2025</h2>
          <p className="text-gray-700">
            This platform is developed as a solution for the Government of Punjab's problem statement 
            in SIH 2025, addressing the critical need for structured disaster preparedness in educational institutions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Interactive disaster preparedness modules</li>
            <li>Gamification with badges and leaderboards</li>
            <li>AI-powered personalized learning</li>
            <li>Virtual drill simulations</li>
            <li>Multilingual support (English, Hindi, Punjabi)</li>
            <li>Real-time progress tracking</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default About;