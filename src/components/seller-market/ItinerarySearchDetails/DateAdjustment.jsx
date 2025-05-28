import { ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const DateAdjustment = ({ adjustment = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If ids array is empty, don't render the component
  if (!adjustment.ids || adjustment.ids.length === 0) {
    return null;
  }

  const toggleCard = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main card content */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleCard}
      >
        <div className="flex items-center">
          {/* Left section - Image and Title */}
          <div className="flex items-center space-x-6 flex-grow">
            <img
              src={adjustment.image}
              alt="Adjustment"
              className="w-16 h-16 rounded-full border border-gray-200 object-cover"
            />
            <h3 className="font-semibold text-lg text-black">{adjustment.title}</h3>
          </div>
          
          {/* Right section - Nearby badge and Arrow icon */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#c1ff72] py-1 px-3 rounded-lg">
              <span className="font-medium text-black text-sm">
                {adjustment.count} Nearby
              </span>
            </div>
            
            <div className="bg-blue-500 rounded-full p-2">
              {isExpanded ? (
                <ChevronUp size={16} className="text-white" />
              ) : (
                <ChevronDown size={16} className="text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-3">
            {adjustment.message && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {adjustment.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DateAdjustment.propTypes = {
  adjustment: PropTypes.shape({
    ids: PropTypes.array,
    title: PropTypes.string,
    message: PropTypes.string,
    image: PropTypes.string,
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    button: PropTypes.string,
  })
};

export default DateAdjustment;