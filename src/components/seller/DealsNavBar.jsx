import React, { useEffect, useState } from 'react';
import { tokenHandler } from '../../utils/tokenHandler';

const DealsNavBar = ({ onButtonClick }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [activeButton, setActiveButton] = useState('Deals'); // Default to 'Deals' as active

  useEffect(() => {
    // Get the current token and extract user data on component mount
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      if (userData && userData.role) {
        // Split the comma-separated roles and trim whitespace
        const rolesArray = userData.role.split(',').map(role => role.trim());
        setUserRoles(rolesArray);
      }
    }
  }, []);

  // Check if user has Operator role
  const hasOperatorRole = userRoles.includes('User');

  // Handle button click to update active button and trigger parent callback
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName); // Update the active button
    onButtonClick(buttonName); // Call the parent's onButtonClick function
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-md -mt-4">
      {/* Main Title */}
      <h2 className="text-left text-2xl font-bold text-gray-800">Seller's</h2>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-3xl mx-auto py-3">
        <button
          className={`px-10 py-2 rounded-lg transition-colors duration-200 shadow-md font-medium ${
            activeButton === 'Deals'
              ? 'bg-white text-gray-900 border border-gray-300'
              : 'bg-gray-900 text-white hover:bg-gray-700 focus:bg-gray-950'
          }`}
          onClick={() => handleButtonClick('Deals')}
        >
          Deals
        </button>

        {/* Only show Haves button if user has Operator role */}
        {hasOperatorRole && (
          <button
            className={`px-10 py-2 rounded-lg transition-colors duration-200 shadow-md font-medium ${
              activeButton === 'Haves'
                ? 'bg-white text-gray-900 border border-gray-300'
                : 'bg-gray-900 text-white hover:bg-gray-700 focus:bg-gray-950'
            }`}
            onClick={() => handleButtonClick('Haves')}
          >
            Haves
          </button>
        )}

        <button
          className={`px-10 py-2 rounded-lg transition-colors duration-200 shadow-md font-medium ${
            activeButton === 'Needs'
              ? 'bg-white text-gray-900 border border-gray-300'
              : 'bg-gray-900 text-white hover:bg-gray-700 focus:bg-gray-950'
          }`}
          onClick={() => handleButtonClick('Needs')}
        >
          Needs
        </button>
      </div>

      {/* Divider Line */}
      <hr className="border-t-3 border-gray-700 mt-1" />
    </div>
  );
};

export default DealsNavBar;