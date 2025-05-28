import { ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import MatchCardDetails from './MatchCardDetails';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';

const MatchCard = ({ match = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    getCompaniesByCategory, 
    companiesByCategory, 
    companiesByCategoryLoading: loading, 
    companiesByCategoryError: error 
  } = useContext(SellerMarketContext);
  
  console.log('Companies by category:', companiesByCategory);

  // If ids array is empty, don't render the component
  if (!match.ids || match.ids.length === 0) {
    return null;
  }

  const toggleCard = async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Fetch companies data when expanding the card
    if (newExpandedState) {
      try {
        await getCompaniesByCategory({
          path: "match",
          itineraryId: match.itineraryId,
          ids: match.ids || []
        });
      } catch (err) {
        console.error('Error in toggleCard:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Main card content */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleCard}
      >
        <div className="flex items-center">
          {/* Left section - Image and Title */}
          <div className="flex items-center space-x-6 flex-grow">
            <img
              src={match.image || '/assets/images/default-company.png'}
              alt="Match"
              className="w-12 h-12 rounded-full border border-gray-200 object-cover"
            />
            <h3 className="font-semibold text-lg text-black">{match.title || 'Empty Legs'}</h3>
          </div>
          
          {/* Right section - Nearby badge and Arrow icon */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#c1ff72] py-1 px-3 rounded-lg">
              <span className="font-medium text-black text-sm">
                {match.ids?.length || 0} Nearby
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
        <div className="bg-gray-50">
          {loading ? (
            <div className="p-4 text-center">
              <span className="text-gray-500">Loading company data...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <span className="text-red-500">{error}</span>
            </div>
          ) : companiesByCategory && companiesByCategory.companyData.length > 0 ? (
            <div>
              {companiesByCategory.companyData.map((company, index) => (
                <MatchCardDetails key={index} company={company} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <span className="text-gray-500">No company data available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    ids: PropTypes.array,
    title: PropTypes.string,
    message: PropTypes.string,
    image: PropTypes.string,
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    button: PropTypes.string,
    path: PropTypes.string,
    itineraryId: PropTypes.string
  })
};

export default MatchCard;