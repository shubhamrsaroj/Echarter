import { useState, useEffect, useContext } from 'react';
import { Search, ChevronDown, ListFilter } from 'lucide-react';
import PropTypes from 'prop-types';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

const TailTypeDropdown = ({ 
  selectedValue, 
  onSelect,
  hasError,
  isTailMode = true
}) => {
  const { 
    companyTails,
    companyTailsLoading,
    companyTailsError,
    getAllCompanyTails,
    aircraftTypesDetails,
    aircraftTypesDetailsLoading,
    aircraftTypesDetailsError,
    getAllAircraftTypesDetails
  } = useContext(SellerMarketContext);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load initial data based on the selected mode
    if (isTailMode) {
      getAllCompanyTails();
    } else {
      getAllAircraftTypesDetails();
    }
  }, [isTailMode, getAllCompanyTails, getAllAircraftTypesDetails]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter based on mode and search term with null checks
  const filteredItems = isTailMode 
    ? (Array.isArray(companyTails) ? companyTails : []).filter(item => item && item.tail && item.tail.toLowerCase().includes(searchTerm.toLowerCase()))
    : (Array.isArray(aircraftTypesDetails) ? aircraftTypesDetails : []).filter(item => item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Add debugging to see what's coming from the context
  useEffect(() => {
    if (!isTailMode) {
      console.log("Aircraft Types Details:", aircraftTypesDetails);
    }
  }, [aircraftTypesDetails, isTailMode]);

  // Display loading, error, or data
  const renderDropdownContent = () => {
    if ((isTailMode && companyTailsLoading) || (!isTailMode && aircraftTypesDetailsLoading)) {
      return <div className="p-2 text-center text-gray-500">Loading...</div>;
    }

    if ((isTailMode && companyTailsError) || (!isTailMode && aircraftTypesDetailsError)) {
      return <div className="p-2 text-center text-red-500">Error loading data</div>;
    }

    if (!filteredItems || filteredItems.length === 0) {
      return <div className="p-2 text-center text-gray-500">No items found</div>;
    }

    return (
      <>
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleSelect(item)}
          >
            {isTailMode ? (item.tail || 'Unknown') : (item.name || 'Unknown')}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="relative w-full">
      {/* Main Dropdown Button */}
      <div 
        className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black cursor-pointer`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 truncate">
            <ListFilter className="w-4 h-4" />
            {selectedValue || `Select ${isTailMode ? 'Tail' : 'Type'}`}
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      
      {/* Error Message */}
      {hasError && (
        <div className="text-red-600 text-xs mt-1">Required field</div>
      )}

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border-2 border-black rounded shadow-lg">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center bg-gray-100 rounded px-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                className="w-full border-none outline-none p-2 bg-transparent"
                placeholder={`Search ${isTailMode ? 'tails' : 'types'}...`}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* List of Items */}
          <div>
            {renderDropdownContent()}
          </div>
        </div>
      )}
    </div>
  );
};

TailTypeDropdown.propTypes = {
  selectedValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  hasError: PropTypes.bool,
  isTailMode: PropTypes.bool
};

export default TailTypeDropdown;
