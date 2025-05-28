import { Plane } from 'lucide-react';
import PropTypes from 'prop-types';

const BaseCard = ({ itineraryData = {} }) => {
  return (
    <div className="space-y-3 ">
      {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 && (
        itineraryData.base.map((option, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-b-3 p-6 relative "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {option.image ? (
                  <img
                    src={option.image}
                    alt={option.category}
                    className="w-24 h-24 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-32 h-24 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100">
                    <Plane size={32} color="black" />
                  </div>
                )}
              </div>
                           
              <h3 className="font-semibold text-xl text-black flex-1 text-center">{option.category}</h3>
                           
              <button
                 className="bg-blue-500 text-white px-10 py-2 rounded-lg text-sm font-medium shadow-md transition-all hover:bg-blue-800"
              >
                Go
              </button>
            </div>
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