import { Plane, ChevronDown, ChevronUp, MessageSquareOff, Zap } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext, useEffect, useRef } from 'react';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

// Company Row component for displaying company details in a table
const CompanyRow = ({ company, onTailInfoUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getCompanyById } = useContext(SellerMarketContext);
  const hasSentTailInfoRef = useRef(false);
  
  // Extract data from the company object safely with defaults
  const name = company?.name || '';
  const fleet = company?.fleet || 0;
  const city = company?.city || '';
  const trustScore = company?.rankOverall || null;
  const certificates = company?.certificates || [];
  const userCount = company?.userCount || 0;
  const responseRate = company?.responseRate || 0;
  const companyId = company?.id;
  const startDis = company?.startDis || '-';
  const endDis = company?.endDis || '-';
  
  // Check if company has valid data
  if (!company) return null;

  // Determine icons to show based on conditions
  const showNoChat = userCount === 0;
  const showFlash = responseRate > 0.5;

  const toggleExpand = async () => {
    // If collapsing, clear tail info first
    if (expanded && onTailInfoUpdate) {
      onTailInfoUpdate([]);
      hasSentTailInfoRef.current = false;
    }
    
    // Toggle the expanded state
    setExpanded(!expanded);
    
    // If expanding and we don't have details yet, fetch them
    if (!expanded && companyId && !companyDetails) {
      setLoading(true);
      try {
        const result = await getCompanyById(companyId);
        setCompanyDetails(result);
        
        // Notify parent to update tail info on map when expanding
        if (result && result.tailInfo && result.tailInfo.length > 0 && onTailInfoUpdate && !hasSentTailInfoRef.current) {
          onTailInfoUpdate(result.tailInfo);
          hasSentTailInfoRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={toggleExpand}>
        <td className="py-2 px-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md">
              {expanded ? (
                <ChevronUp size={18} className="text-black" strokeWidth={2} />
              ) : (
                <ChevronDown size={18} className="text-black" strokeWidth={2} />
              )}
            </div>
            <div className="text-blue-600 text-xs">{name}</div>
          </div>
        </td>
        <td className="py-2 px-3">
          <div className="font-medium text-black text-xs">{city}</div>
        </td>
        <td className="py-2 px-3">
          <div className="text-xs font-medium text-black">{fleet}</div>
        </td>
        <td className="py-2 px-3">
          <div className="text-xs font-medium text-black">{parseInt(startDis) || '-'}</div>
        </td>
        <td className="py-2 px-3">
          <div className="text-xs font-medium text-black">{parseInt(endDis) || '-'}</div>
        </td>
        <td className="py-2 px-3">
          <div className="flex items-center space-x-1">
            {certificates && certificates.length > 0 ? (
              certificates.map((cert, index) => (
                <img 
                  key={index} 
                  src={cert.logo} 
                  alt={cert.name} 
                  title={cert.name}
                  className="h-5 w-auto object-contain" 
                />
              ))
            ) : null}
          </div>
        </td>
        <td className="py-2 px-3 flex items-center justify-between">
          <div>
            {trustScore ? (
              <div className="text-xs font-medium text-blue-600">{trustScore}</div>
            ) : (
              <div className="text-xs font-medium text-transparent">-</div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!showNoChat && (
              <div className="p-1 rounded-md" >
                <MessageSquareOff size={18} className="text-black" strokeWidth={2} />
              </div>
            )}
            {showFlash && (
              <div className="p-1 rounded-md" title="Fast response">
                <Zap size={18} className="text-black" strokeWidth={2} />
              </div>
            )}
          </div>
        </td>
      </tr>
      
      {/* Expandable content for tail information */}
      {expanded && (
        <tr>
          <td colSpan="7" className="bg-gray-50 px-4 py-2 w-full">
            {loading ? (
              <div className="text-center py-2">Loading tail information...</div>
            ) : companyDetails && companyDetails.tailInfo && companyDetails.tailInfo.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full w-full bg-white text-sm border-t border-gray-200 table-fixed">
                  <thead className="bg-[#EAE5FE] text-xs">
                    <tr>
                      <th className="py-2 px-3 text-left font-medium text-black">Reg</th>
                      <th className="py-2 px-3 text-left font-medium text-black">Type</th>
                      <th className="py-2 px-3 text-left font-medium text-black">Seats</th>
                      <th className="py-2 px-3 text-left font-medium text-black">Cat</th>
                      <th className="py-2 px-3 text-left font-medium text-black">YOM</th>
                      <th className="py-2 px-3 text-left font-medium text-black">FT</th>
                      <th className="py-2 px-3 text-left font-medium text-black">Base</th>
                      <th className="py-2 px-3 text-left font-medium text-black">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyDetails.tailInfo.map((tail) => {
                      // Extract first category if there are multiple categories separated by commas
                      const category = tail.tailCategory || '';
                      return (
                        <tr key={tail.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div className="text-blue-600 text-xs">{tail.tail}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">{tail.aircraft_Type_Name || '-'}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">{tail.tail_Max_Pax || '-'}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs">{category || '-'}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">-</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">-</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">{tail.base || '-'}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium">{tail.rate || '-'}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-2 text-gray-500">No tail information available</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

// Company Table component for displaying multiple companies
const CompanyTable = ({ companiesData, loading, error, onTailInfoUpdate }) => {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <span className="text-gray-500">Loading company data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }
  
  if (!companiesData || !companiesData.companyData || companiesData.companyData.length === 0) {
    return (
      <div className="p-4 text-center border border-gray-200 rounded-lg">
        <span className="text-gray-500">No company data available</span>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-[#EAE5FE] text-xs">
          <tr>
            <th className="py-2 px-3 text-left font-medium text-black">Company</th>
            <th className="py-2 px-3 text-left font-medium text-black">City</th>
            <th className="py-2 px-3 text-left font-medium text-black">Fleet</th>
            <th className="py-2 px-3 text-left font-medium text-black uppercase">SD</th>
            <th className="py-2 px-3 text-left font-medium text-black uppercase">ED</th>
            <th className="py-2 px-3 text-left font-medium text-black">Certificates</th>
            <th className="py-2 px-3 text-left font-medium text-black">Trust Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {companiesData.companyData.map((company, idx) => (
            <CompanyRow key={idx} company={company} onTailInfoUpdate={onTailInfoUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Category Card component for displaying a single category with expandable details
const CategoryCard = ({ option, isExpanded, toggleExpand, companiesData, loading, error, onTailInfoUpdate }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main card content - reduced height */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpand}
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
        <div className="border-t border-gray-100">
          {loading ? (
            <div className="p-4 text-center">
              <span className="text-gray-500">Loading company data...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <span className="text-red-500">{error}</span>
            </div>
          ) : companiesData && companiesData.companyData && companiesData.companyData.length > 0 ? (
            <div className="overflow-x-auto border-gray-200">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-[#EAE5FE] text-xs">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-black">Company</th>
                    <th className="py-2 px-3 text-left font-medium text-black">City</th>
                    <th className="py-2 px-3 text-left font-medium text-black">Fleet</th>
                    <th className="py-2 px-3 text-left font-medium text-black uppercase">SD</th>
                    <th className="py-2 px-3 text-left font-medium text-black uppercase">ED</th>
                    <th className="py-2 px-3 text-left font-medium text-black">Certificates</th>
                    <th className="py-2 px-3 text-left font-medium text-black">Trust Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companiesData.companyData.map((company, idx) => (
                    <CompanyRow key={idx} company={company} onTailInfoUpdate={onTailInfoUpdate} />
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
  );
};

// Main BaseCard component
const BaseCard = ({ itineraryData = {}, isTabContent = false, selectedCategory = null, onTailInfoUpdate }) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const isMountedRef = useRef(false);
  const previousCategoryRef = useRef(null);
  const tailInfoClearedRef = useRef(false);
  
  const { 
    getCompaniesByCategory, 
    companiesByCategory, 
    companiesByCategoryLoading: loading, 
    companiesByCategoryError: error 
  } = useContext(SellerMarketContext);

  // Reset dataFetched when selectedCategory changes
  useEffect(() => {
    if (selectedCategory && previousCategoryRef.current !== selectedCategory) {
      setDataFetched(false);
      previousCategoryRef.current = selectedCategory;
    }
  }, [selectedCategory]);
  
  // Clear tail info when component unmounts
  useEffect(() => {
    return () => {
      // Clear any tail markers when component unmounts
      if (onTailInfoUpdate && !tailInfoClearedRef.current) {
        onTailInfoUpdate([]);
        tailInfoClearedRef.current = true;
      }
    };
  }, [onTailInfoUpdate]);
  
  // Fetch data when component mounts if it's a tab content
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    const fetchData = async () => {
      // Only fetch if we're in tab content mode, have the necessary data, and haven't fetched yet
      if (isTabContent && 
          itineraryData?.itineraryResponseNewdata && 
          itineraryData?.base?.length > 0 && 
          !dataFetched && 
          isMountedRef.current) {
        
        const option = itineraryData.base[0];
        const fromCoords = itineraryData.itineraryResponseNewdata.fromCoordinates;
        const toCoords = itineraryData.itineraryResponseNewdata.toCoordinates;
        const pax = itineraryData.itineraryResponseNewdata.pax || 4;
        const maxLeg = itineraryData.itineraryResponseNewdata.maxLeg || '';
        
        try {
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
          
          // Mark as fetched so we don't fetch again
          if (isMountedRef.current) {
            setDataFetched(true);
          }
        } catch (err) {
          console.error('Error fetching base data:', err);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [isTabContent, dataFetched, getCompaniesByCategory]);
  
  const toggleCard = async (index, option) => {
    // If card is already expanded, clear tail markers before toggling
    if (expandedCards[index] && onTailInfoUpdate) {
      onTailInfoUpdate([]);
    }
    
    const newExpandedState = !expandedCards[index];
    setExpandedCards(prev => ({
      ...prev,
      [index]: newExpandedState
    }));
    
    // Fetch companies data when expanding the card
    if (newExpandedState && itineraryData?.itineraryResponseNewdata) {
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

  // If no base data, return null
  if (!Array.isArray(itineraryData.base) || itineraryData.base.length === 0) {
    return null;
  }

  // If this is a tab content, show details directly
  if (isTabContent) {
    const option = itineraryData.base[0];
    
    return (
      <div>
        {/* Header with category info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-black">{option.category}</h3>
          </div>
        </div>
        
        {/* Company Data */}
        <CompanyTable 
          companiesData={companiesByCategory}
          loading={loading}
          error={error}
          onTailInfoUpdate={onTailInfoUpdate}
        />
      </div>
    );
  }

  // Regular card view (for non-tab usage)
  return (
    <div className="space-y-3">
      {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 && (
        itineraryData.base.map((option, index) => (
          <CategoryCard 
            key={index}
            option={option}
            isExpanded={expandedCards[index]}
            toggleExpand={() => toggleCard(index, option)}
            companiesData={companiesByCategory}
            loading={loading}
            error={error}
            onTailInfoUpdate={onTailInfoUpdate}
          />
        ))
      )}
    </div>
  );
};

// PropTypes definitions
CompanyRow.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    fleet: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rankOverall: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    certificates: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        logo: PropTypes.string
      })
    ),
    userCount: PropTypes.number,
    responseRate: PropTypes.number,
    startDis: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    endDis: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onTailInfoUpdate: PropTypes.func
};

CompanyTable.propTypes = {
  companiesData: PropTypes.shape({
    companyData: PropTypes.array
  }),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onTailInfoUpdate: PropTypes.func
};

CategoryCard.propTypes = {
  option: PropTypes.shape({
    category: PropTypes.string,
    message: PropTypes.string,
    image: PropTypes.string
  }),
  isExpanded: PropTypes.bool,
  toggleExpand: PropTypes.func,
  companiesData: PropTypes.shape({
    companyData: PropTypes.array
  }),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onTailInfoUpdate: PropTypes.func
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
  }),
  isTabContent: PropTypes.bool,
  selectedCategory: PropTypes.string,
  onTailInfoUpdate: PropTypes.func
};

export default BaseCard;