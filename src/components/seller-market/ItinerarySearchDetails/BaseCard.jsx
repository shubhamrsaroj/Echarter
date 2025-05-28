import { Plane, ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const BaseCard = ({ itineraryData = {} }) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-3">
      {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 && (
        itineraryData.base.map((option, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Main card content - reduced height */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.category}
                      className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100">
                      <Plane size={24} color="black" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg text-black">{option.category}</h3>
                  </div>
                </div>
                
                {/* Arrow icon */}
                <div className="flex items-center">
                  <div className="bg-black rounded-full p-2">
                    {expandedCards[index] ? (
                      <ChevronUp size={16} className="text-white" />
                    ) : (
                      <ChevronDown size={16} className="text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expandable content */}
            {expandedCards[index] && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="pt-3">
                  {option.message && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {option.message}
                    </p>
                  )}
                  {/* Add any additional expandable content here */}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

BaseCard.propTypes = {
  itineraryData: PropTypes.shape({
    base: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string,
        message: PropTypes.string,
        image: PropTypes.string,
        totalFlightTime: PropTypes.string,
        buttonName: PropTypes.string
      })
    )
  })
};

export default BaseCard;