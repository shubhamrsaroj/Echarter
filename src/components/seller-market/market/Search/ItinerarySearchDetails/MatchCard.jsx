import { ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

// Check if an item was created within the last 12 hours
const isNew = (createdDate) => {
  if (!createdDate) return false;
  try {
    const created = new Date(createdDate);
    // Check if the date is valid
    if (isNaN(created.getTime())) return false;
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 12;
  } catch (error) {
    console.error("Error parsing date:", error);
    return false;
  }
};

// Flight table row component for reuse
const FlightTableRow = ({ flight, handleMouseEnter, handleMouseLeave, showCompany = false }) => (
  <tr 
    className="hover:bg-gray-50"
    onMouseEnter={() => handleMouseEnter(flight)}
    onMouseLeave={handleMouseLeave}
  >
    {showCompany && (
      <td className="py-2 px-3">
        <div className="flex items-center space-x-2">
          <div className="font-medium text-blue-600 text-xs">{flight.companyName || 'N/A'}</div>
          {flight.hasCertificates && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Certified</span>
          )}
        </div>
      </td>
    )}
    <td className="py-2 px-3">
      <div className="font-medium text-gray-900 text-xs">{flight.acType || 'N/A'}</div>
      <div className="flex items-center space-x-1">
        {flight.registration && (
          <div className="text-xs text-blue-600">{flight.registration}</div>
        )}
      </div>
    </td>
    <td className="py-2 px-3">
      <div className="font-medium text-gray-900 text-xs">{flight.acCat || 'N/A'}</div>
    </td>
    <td className="py-2 px-3">
      <div className="font-medium text-gray-900 text-xs">{flight.availType || 'N/A'}</div>
    </td>
    <td className="py-2 px-3">
      {isNew(flight.createdDate) && (
        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">Tag</span>
      )}
    </td>
    <td className="py-2 px-3 text-xs font-medium text-gray-900">
      {flight.rankOverall || ''}
      {flight.rankOverall && (
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-yellow-400 h-1.5 rounded-full" 
            style={{ width: `${flight.rankOverall}%` }}
          ></div>
        </div>
      )}
    </td>
    <td className="py-2 px-3 text-center">
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    </td>
  </tr>
);

// Company Details component for grouped view
const CompanyDetails = ({ company, sortDirection, filters, setHoveredFlightCoords }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract data from the company object safely with defaults
  const name = company?.name || '';
  const certificates = company?.certificates || [];
  const haves = company?.haves || [];
  
  // Handle mouse enter/leave events
  const handleMouseEnter = (have) => {
    if (!setHoveredFlightCoords) return;
    // Pass the entire flight object to the hover handler
    setHoveredFlightCoords(have);
  };
  
  const handleMouseLeave = () => {
    if (setHoveredFlightCoords) {
      setHoveredFlightCoords(null);
    }
  };
  
  // Apply filters and sorting to haves
  const filteredAndSortedHaves = useMemo(() => {
    if (!haves.length) return [];
    
    let filtered = [...haves];
    
    // Apply filters if they exist
    if (filters) {
      // Filter by aircraft category
      const selectedCategories = Object.entries(filters.categories)
        .filter(([, isSelected]) => isSelected)
        .map(([category]) => category);
      
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(have => selectedCategories.includes(have.acCat));
      }
      
      // Filter by certificates
      if (filters.hasCertificates && (!certificates || certificates.length === 0)) {
        return [];
      }
    }
    
    // Apply sorting by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.dateFrom || a.createdDate);
      const dateB = new Date(b.dateFrom || b.createdDate);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [haves, filters, sortDirection, certificates]);

  // Early returns after all hooks are called
  if (!company || haves.length === 0) return null;
  
  return (
    <div className="border-t border-gray-200">
      <div 
        className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >     
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-sm">{name}</span>
          {certificates && certificates.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Certified</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-120 rounded-full p-1.5">
            {isExpanded ? (
              <ChevronUp size={18} className="text-black" />
            ) : (
              <ChevronDown size={18} className="text-black" />
            )}
          </div>
        </div>
      </div>

      {/* Aircraft Listings */}
      {isExpanded && (
        <div className="overflow-x-auto border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-[#EAE5FE] text-xs">
              <tr>
                <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Aircraft Type</th>
                <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Cat</th>
                <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Available Type</th>
                <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Latency</th>
                <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Rank</th>
                <th className="py-2 px-3 text-center font-medium text-black tracking-wider">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedHaves.length > 0 ? (
                filteredAndSortedHaves.map((have, index) => (
                  <FlightTableRow 
                    key={index}
                    flight={have}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    showCompany={false}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    No aircraft matching the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main MatchCard component
const MatchCard = ({ 
  match = {}, 
  setHoveredFlightCoords, 
  isTabContent = false,
  viewMode = 'unified', // 'unified' or 'grouped'
  company = null // Used when viewMode is 'details' for a single company
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    categories: {},
    hasCertificates: false
  });
  const [dataFetched, setDataFetched] = useState(false);
  const isMountedRef = useRef(false);
  
  const filterRef = useRef(null);
  const tableRef = useRef(null);
  
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
  
  // Fetch data when component mounts if it's a tab content
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    const fetchData = async () => {
      if (isTabContent && !dataFetched && isMountedRef.current && match.ids && match.ids.length > 0) {
        try {
          await getCompaniesByCategory({
            path: "match",
            itineraryId: match.itineraryId,
            ids: match.ids || []
          });
          
          // Mark as fetched so we don't fetch again
          if (isMountedRef.current) {
            setDataFetched(true);
          }
        } catch (err) {
          console.error('Error fetching match data:', err);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [isTabContent, match, getCompaniesByCategory, dataFetched]);

  // Handle mouse enter for map hover functionality
  const handleMouseEnter = (have) => {
    if (!setHoveredFlightCoords) return;
    // Pass the entire flight object to the hover handler
    setHoveredFlightCoords(have);
  };
  
  // Handle mouse leave for map hover functionality
  const handleMouseLeave = () => {
    // Only remove hover if the mouse is not over the table
    if (!tableRef.current?.contains(document.activeElement) && 
        !tableRef.current?.matches(':hover')) {
      if (setHoveredFlightCoords) {
        setHoveredFlightCoords(null);
      }
    }
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!companiesByCategory?.companyData) return [];
    
    return companiesByCategory.companyData
      .filter(company => {
        // Apply category filter
        const categoryFiltersActive = Object.values(filters.categories).some(v => v);
        if (categoryFiltersActive) {
          if (!company.haves || company.haves.length === 0) return false;
          
          // Check if any of the company's aircraft match the selected categories
          const hasMatchingCategory = company.haves.some(have => 
            have.acCat && filters.categories[have.acCat]
          );
          
          if (!hasMatchingCategory) return false;
        }
        
        // Apply certificates filter
        if (filters.hasCertificates) {
          if (!company.certificates || company.certificates.length === 0) return false;
        }
        
        return true;
      });
  }, [companiesByCategory, filters]);

  // Flatten all flights from all companies into a single array
  const allFlights = useMemo(() => {
    const flights = [];
    
    filteredCompanies.forEach(company => {
      if (company.haves && Array.isArray(company.haves)) {
        company.haves.forEach(have => {
          flights.push({
            ...have,
            companyName: company.name,
            hasCertificates: company.certificates && company.certificates.length > 0
          });
        });
      }
    });
    
    // Sort flights by date
    return flights.sort((a, b) => {
      const dateA = new Date(a.dateFrom || a.createdDate || 0);
      const dateB = new Date(b.dateFrom || b.createdDate || 0);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredCompanies, sortDirection]);
  
  // If viewMode is 'details' and we have a company, just render the company details
  if (viewMode === 'details' && company) {
    return <CompanyDetails 
      company={company} 
      sortDirection={sortDirection} 
      filters={filters}
      setHoveredFlightCoords={setHoveredFlightCoords}
    />;
  }
  
  // If ids array is empty, don't render the component
  if (!match.ids || match.ids.length === 0) {
    return null;
  }
  
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
    <div>
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-black">{match.title || 'Empty Legs'}</h3>
        
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
            <span>Sort by Date {sortDirection === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>
      
      {/* Content Display */}
      {loading ? (
        <div className="p-4 text-center">
          <span className="text-gray-500">Loading flight data...</span>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <span className="text-red-500">{error}</span>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped View (Company by Company) */
        <div>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
              <CompanyDetails 
                key={index}
                company={company}
                sortDirection={sortDirection}
                filters={filters}
                setHoveredFlightCoords={setHoveredFlightCoords}
              />
            ))
          ) : (
            <div className="p-4 text-center border border-gray-200 rounded-lg">
              <span className="text-gray-500">No companies matching the selected filters</span>
            </div>
          )}
        </div>
      ) : (
        /* Unified Table View */
        allFlights.length > 0 ? (
          <div className="overflow-x-auto border-gray-200" ref={tableRef}>
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-[#EAE5FE] text-xs">
                <tr>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Company</th>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Aircraft Type</th>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Cat</th>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Available Type</th>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Latency</th>
                  <th className="py-2 px-3 text-left font-medium text-black tracking-wider">Rank</th>
                  <th className="py-2 px-3 text-center font-medium text-black tracking-wider">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allFlights.map((flight, index) => (
                  <FlightTableRow 
                    key={index}
                    flight={flight}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    showCompany={true}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center border border-gray-200 rounded-lg">
            <span className="text-gray-500">No flights matching the selected filters</span>
          </div>
        )
      )}
    </div>
  );
};

// PropTypes definitions
FlightTableRow.propTypes = {
  flight: PropTypes.object.isRequired,
  handleMouseEnter: PropTypes.func.isRequired,
  handleMouseLeave: PropTypes.func.isRequired,
  showCompany: PropTypes.bool
};

CompanyDetails.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    certificates: PropTypes.array,
    haves: PropTypes.array
  }),
  sortDirection: PropTypes.string,
  filters: PropTypes.object,
  setHoveredFlightCoords: PropTypes.func
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
  }),
  setHoveredFlightCoords: PropTypes.func,
  isTabContent: PropTypes.bool,
  viewMode: PropTypes.oneOf(['unified', 'grouped', 'details']),
  company: PropTypes.object
};

export default MatchCard;