import { Plane, ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import BaseCardDetails from './BaseCardDetails';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

const BaseCard = ({ itineraryData = {} }) => {
  const [expandedCards, setExpandedCards] = useState({});
  
  const { 
    getCompaniesByCategory, 
    companiesByCategory, 
    companiesByCategoryLoading: loading, 
    companiesByCategoryError: error 
  } = useContext(SellerMarketContext);

  console.log(itineraryData);
  
  const toggleCard = async (index, option) => {
    const newExpandedState = !expandedCards[index];
    setExpandedCards(prev => ({
      ...prev,
      [index]: newExpandedState
    }));
    
    // Fetch companies data when expanding the card
    if (newExpandedState && itineraryData.itineraryResponseNewdata) {
      try {
        const fromCoords = itineraryData.itineraryResponseNewdata.fromCoordinates;
        const toCoords = itineraryData.itineraryResponseNewdata.toCoordinates;
        const pax = itineraryData.itineraryResponseNewdata.pax || 4;
        const maxLeg = itineraryData.itineraryResponseNewdata.maxLeg || '';
        
        await getCompaniesByCategory({
          path: "base",
          category: option.category,
          fromCoordinates: `${fromCoords.latitude},${fromCoords.longitude}`,
          toCoordinates: `${toCoords.latitude},${toCoords.longitude}`,
          pax: pax,
          maxLeg: maxLeg,
          pageNumber: 1,
          pageSize: 30,
          seenPrice: option.price,
          seenCurrency: option.currencySymbol || "USD"
        });
      } catch (err) {
        console.error('Error in toggleCard:', err);
      }
    }
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
              onClick={() => toggleCard(index, option)}
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
              <div className="border-t border-gray-100">
                {loading ? (
                  <div className="p-4 text-center">
                    <span className="text-gray-500">Loading company data...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <span className="text-red-500">{error}</span>
                  </div>
                ) : companiesByCategory && companiesByCategory.companyData && companiesByCategory.companyData.length > 0 ? (
                  <div className="overflow-x-auto border-t border-gray-200">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-[#bdf5f8] text-xs">
                        <tr>
                          <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Company</th>
                          <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">City</th>
                          <th className="py-2 px-3"></th> {/* No heading for certificates */}
                          <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Fleet Size</th>
                          <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Trust Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {companiesByCategory.companyData.map((company, idx) => (
                          <BaseCardDetails key={idx} company={company} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-4 pb-4">
                    <div className="pt-3">
                      {option.message && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {option.message}
                        </p>
                      )}
                      <div className="p-4 text-center">
                        <span className="text-gray-500">No company data available</span>
                      </div>
                    </div>
                  </div>
                )}
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
        buttonName: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        currencySymbol: PropTypes.string
      })
    ),
    itineraryResponseNewdata: PropTypes.shape({
      fromCoordinates: PropTypes.object,
      toCoordinates: PropTypes.object,
      pax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      maxLeg: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  })
};

export default BaseCard;