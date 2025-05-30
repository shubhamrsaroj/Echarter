import PropTypes from 'prop-types';
import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MatchCardDetails = ({ company, parentSortDirection, parentFilters, setHoveredFlightCoords }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Sync with parent sort direction when it changes
  useEffect(() => {
    if (parentSortDirection) {
      setSortDirection(parentSortDirection);
    }
  }, [parentSortDirection]);
  
  // Extract data from the company object safely with defaults
  const name = company?.name || '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const certificates = company?.certificates || [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const haves = company?.haves || [];
  
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
  
  // Handle mouse enter for map hover functionality
  const handleMouseEnter = (have) => {
    // Check for direct lat/long properties first
    if (have.fromLat && have.fromLong && have.toLat && have.toLong) {
      const coords = {
        fromLat: have.fromLat,
        fromLong: have.fromLong,
        toLat: have.toLat,
        toLong: have.toLong,
        fromCity: have.fromCity ,
        toCity: have.toCity,
      };
    
      setHoveredFlightCoords(coords);
      return;
    }
    
    // Check for nested coordinates objects
    if (have.fromCoordinates && have.toCoordinates) {
      console.log('Using nested coordinate objects');
      const coords = {
        fromLat: have.fromCoordinates.lat,
        fromLong: have.fromCoordinates.long,
        toLat: have.toCoordinates.lat,
        toLong: have.toCoordinates.long,
        fromCity: have.fromCity ,
        toCity: have.toCity ,
      };
      setHoveredFlightCoords(coords);
      return;
    }
  };
  
  // Handle mouse leave for map hover functionality
  const handleMouseLeave = () => {
    if (setHoveredFlightCoords) {
      setHoveredFlightCoords(null);
    } else {
      console.log('setHoveredFlightCoords is not defined');
    }
  };
  
  // Apply filters and sorting to haves
  const filteredAndSortedHaves = useMemo(() => {
    if (!haves.length) return [];
    
    let filtered = [...haves];
    
    // Apply parent filters if they exist
    if (parentFilters) {
      // Filter by aircraft category
      const selectedCategories = Object.entries(parentFilters.categories)
        .filter(([, isSelected]) => isSelected)
        .map(([category]) => category);
      
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(have => selectedCategories.includes(have.acCat));
      }
      
      // Filter by certificates
      if (parentFilters.hasCertificates && (!certificates || certificates.length === 0)) {
        return [];
      }
    }
    
    // Apply sorting by createdDate
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [haves, parentFilters, sortDirection, certificates]);

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

      {/* Aircraft Listings in Single Table Format */}
      {isExpanded && (
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-[#bdf5f8] text-xs">
              <tr>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Aircraft Type</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">From</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">To</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Date From</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Date To</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Seats</th>
                <th className="py-2 px-3 text-left font-medium text-black uppercase tracking-wider">Price</th>
                <th className="py-2 px-3 text-center font-medium text-black uppercase tracking-wider">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedHaves.length > 0 ? (
                filteredAndSortedHaves.map((have, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50"
                    onMouseEnter={() => handleMouseEnter(have)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 text-xs">{have.acType || 'N/A'}</div>
                      <div className="flex items-center space-x-1">
                        {have.registration && (
                          <div className="text-xs text-blue-600">{have.registration}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 text-xs">{have.fromCity || 'N/A'}</div>
                      {have.fromIcao && (
                        <div className="text-xs text-black">{have.fromIcao}</div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 text-xs">{have.toCity || 'N/A'}</div>
                      {have.toIcao && (
                        <div className="text-xs text-black">{have.toIcao}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs font-medium text-gray-900">{formatDate(have.dateFrom)}</td>
                    <td className="py-2 px-3 text-xs font-medium text-gray-900">{formatDate(have.dateTo)}</td>
                    <td className="py-2 px-3 text-xs font-medium text-gray-900">{have.seats || 'N/A'}</td>
                    <td className="py-2 px-3 text-xs font-medium text-green-600">{have.price || 'N/A'}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {isNew(have.createdDate) && (
                          <span className="bg-yellow-500 text-white text-xs rounded-sm">New</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-gray-500">
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

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().substr(2)}`;
  } catch {
    return dateString; 
  }
};

MatchCardDetails.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    logo: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    certificates: PropTypes.array,
    haves: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        dateFrom: PropTypes.string,
        dateTo: PropTypes.string,
        acType: PropTypes.string,
        fromCity: PropTypes.string,
        toCity: PropTypes.string,
        fromIcao: PropTypes.string,
        toIcao: PropTypes.string,
        seats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.string,
        availType: PropTypes.string,
        registration: PropTypes.string,
        acCat: PropTypes.string,
        createdDate: PropTypes.string,
        fromCoordinates: PropTypes.shape({
          lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          long: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        }),
        toCoordinates: PropTypes.shape({
          lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          long: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        }),
        fromLat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        fromLong: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        toLat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        toLong: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      })
    )
  }),
  parentSortDirection: PropTypes.string,
  parentFilters: PropTypes.object,
  setHoveredFlightCoords: PropTypes.func
};

export default MatchCardDetails;