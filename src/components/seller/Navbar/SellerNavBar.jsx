import React, {  useState } from 'react';

const SellerNavBar = ({ onButtonClick }) => {
  const [activeButton, setActiveButton] = useState(''); // No default active button

  // Handle button click to update active button and trigger parent callback
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName); // Update the active button
    onButtonClick(buttonName); // Call the parent's onButtonClick function
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-md -mt-4">
      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-3xl mx-auto py-3">
        {['Deals', 'Haves', 'Needs'].map((buttonName) => (
          <button
            key={buttonName}
            className={`px-10 py-2 rounded-lg transition-colors duration-200 shadow-md font-medium border border-gray-300 ${
              activeButton === buttonName ? 'bg-white text-gray-900' : 'bg-gray-900 text-white hover:bg-gray-700 focus:bg-gray-950'
            }`}
            onClick={() => handleButtonClick(buttonName)}
          >
            {buttonName}
          </button>
        ))}
      </div>

      {/* Divider Line */}
      <hr className="border-t-3 border-gray-700 mt-1" />
    </div>
  );
};

export default SellerNavBar;