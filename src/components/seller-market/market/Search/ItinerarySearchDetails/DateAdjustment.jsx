import { ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext, useEffect, useRef, useMemo } from 'react';
import DateAdjustmentDetails from './DateAdjustmentDetails';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

const DateAdjustment = ({ adjustment = {}, setHoveredFlightCoords }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    categories: {},
    hasCertificates: false
  });
  
  const filterRef = useRef(null);
  
  const { 
    getCompaniesByCategory, 
    companiesByCategory, 
    companiesByCategoryLoading: loading, 
    companiesByCategoryError: error 
  } = useContext(SellerMarketContext);
  
  // Extract unique aircraft categories from the data
  const uniqueCategories = useMemo(() => {
    if (!companiesByCategory?.companyData) return [];
    
    // Get all unique aircraft categories from all companies' haves
    const categories = new Set();
    companiesByCategory.companyData.forEach(company => {
      if (company.haves && Array.isArray(company.haves)) {
        company.haves.forEach(have => {
          if (have.acCat) {
            categories.add(have.acCat);
          }
        });
      }
    });
    
    return Array.from(categories);
  }, [companiesByCategory]);
  
  // Initialize filter categories when unique categories are loaded
  useEffect(() => {
    if (uniqueCategories.length > 0) {
      const initialCategories = {};
      uniqueCategories.forEach(category => {
        initialCategories[category] = false;
      });
      
      setFilters(prev => ({
        ...prev,
        categories: initialCategories
      }));
    }
  }, [uniqueCategories]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If ids array is empty, don't render the component
  if (!adjustment.ids || adjustment.ids.length === 0) {
    return null;
  }

  const toggleCard = async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Fetch companies data when expanding the card
    if (newExpandedState) {
      try {
        await getCompaniesByCategory({
          path: "dateAdjustment",
          itineraryId: adjustment.itineraryId,
          ids: adjustment.ids || []
        });
      } catch (err) {
        console.error('Error in toggleCard:', err);
      }
    }
  };
  
  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const handleFilterChange = (type, value) => {
    if (type === 'category') {
      setFilters(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [value]: !prev.categories[value]
        }
      }));
    } else if (type === 'certificates') {
      setFilters(prev => ({
        ...prev,
        hasCertificates: !prev.hasCertificates
      }));
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
        <div className="bg-gray-50">
          {/* Filter and Sort Controls */}
          <div className="flex justify-end items-center p-3 bg-white border-t border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button 
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilters(!showFilters);
                  }}
                >
                  <ListFilter size={16} />
                  <span>Filter</span>
                </button>
                
                {showFilters && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-lg border border-gray-200 rounded-md p-3 z-10 w-56">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft Category</label>
                      <div className="space-y-2">
                        {uniqueCategories.map(category => (
                          <div key={category} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`category-${category}`} 
                              className="mr-2"
                              checked={filters.categories[category] || false}
                              onChange={() => handleFilterChange('category', category)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm">{category}</label>
                          </div>
                        ))}
                        {uniqueCategories.length === 0 && (
                          <div className="text-sm text-gray-500">No categories available</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="hasCerts" 
                        className="mr-2"
                        checked={filters.hasCertificates}
                        onChange={() => handleFilterChange('certificates')}
                      />
                      <label htmlFor="hasCerts" className="text-sm">Has Certificates</label>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sort Button */}
              <button 
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
                onClick={toggleSort}
              >
                <ListFilter size={16} />
                <span>Sort by Date {sortDirection === 'asc' ? '↑' : '↓'}</span>
              </button>
            </div>
          </div>
          
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
                <DateAdjustmentDetails 
                  key={index} 
                  company={company} 
                  parentSortDirection={sortDirection}
                  parentFilters={filters}
                  setHoveredFlightCoords={setHoveredFlightCoords}
                />
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

DateAdjustment.propTypes = {
  adjustment: PropTypes.shape({
    ids: PropTypes.array,
    title: PropTypes.string,
    message: PropTypes.string,
    image: PropTypes.string,
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    button: PropTypes.string,
    path: PropTypes.string,
    itineraryId: PropTypes.string
  }),
  setHoveredFlightCoords: PropTypes.func
};

export default DateAdjustment;