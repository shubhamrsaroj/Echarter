import React, { useState } from 'react';

const SellerNavBar = ({ onButtonClick, isOperator }) => {
  const [activeButton, setActiveButton] = useState(''); // No default active button
  
  // Handle button click to update active button and trigger parent callback
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName); // Update the active button
    onButtonClick(buttonName); // Call the parent's onButtonClick function
  };

  // Filter buttons based on user role
  const navButtons = ['Deals', 'Needs'];
  if (isOperator) {
    navButtons.splice(1, 0, 'Haves'); // Insert 'Haves' between 'Deals' and 'Needs' for Operators
  }
  
  return (
    <div className="p-6 rounded-sm -mt-4 seller-navbar">
      {/* Navigation Buttons */}
      <div className="flex w-full mx-auto py-3 gap-4">
        {navButtons.map((buttonName) => (
          <button
            key={buttonName}
            className={`flex-1 py-3 rounded-lg transition-colors duration-200 shadow-md font-medium border border-gray-300 ${
              activeButton === buttonName ? 'bg-white text-gray-900' : 'bg-gray-900 text-white hover:bg-gray-700 focus:bg-gray-950'
            }`}
            onClick={() => handleButtonClick(buttonName)}
          >
            {buttonName}
          </button>
        ))}
      </div>
      
      {/* Divider Line */}
      <hr className="border-t-4 border-gray-700 mt-1" />
    </div>
  );
};

export default SellerNavBar;