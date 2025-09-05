import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiAlertCircle } from 'react-icons/fi';

const EmergencyContacts = () => {
  const contacts = [
    { name: 'Police', number: '100', description: 'Law enforcement emergency' },
    { name: 'Fire Department', number: '101', description: 'Fire emergency services' },
    { name: 'Ambulance', number: '108', description: 'Medical emergency' },
    { name: 'Disaster Helpline', number: '1078', description: 'Natural disaster assistance' },
    { name: 'Women Helpline', number: '1091', description: 'Women in distress' },
    { name: 'Child Helpline', number: '1098', description: 'Child welfare emergency' },
    { name: 'Punjab Emergency', number: '112', description: 'State emergency services' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Emergency Contacts</h1>
        <p className="text-gray-600">Important numbers for emergency situations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-3">
              <FiPhone className="text-red-500 mr-2" size={24} />
              <h3 className="text-xl font-semibold">{contact.name}</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">{contact.number}</p>
            <p className="text-gray-600 text-sm">{contact.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-center mb-2">
          <FiAlertCircle className="text-red-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold">Emergency Guidelines</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Stay calm and assess the situation</li>
          <li>Call the appropriate emergency number</li>
          <li>Provide clear location and situation details</li>
          <li>Follow instructions from emergency personnel</li>
          <li>Do not hang up unless instructed</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default EmergencyContacts;