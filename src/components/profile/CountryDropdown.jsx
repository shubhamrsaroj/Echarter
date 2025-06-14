import React, { useState, useEffect, useRef } from 'react';
import { countryService } from '../../api/profile/countryService';

const CountryDropdown = ({ value, onChange, name }) => {
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const result = await countryService.getAllCountries();
        if (result.success) {
          setCountries(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch countries');
        }
      } catch (err) {
        setError(err.message);
        console.error('Country fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      (country.code && country.code.toLowerCase().includes(query))
    );
  });

  // Handle selection
  const handleSelect = (countryName, countryCode) => {
    onChange({ 
      target: { 
        name, 
        value: countryName,
        countryCode: countryCode 
      } 
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected country button */}
      <button 
        type="button"
        className="w-full bg-white border border-gray-300 rounded-lg p-2 mt-1 text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || 'Select country'}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-300">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading countries...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No countries found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => handleSelect(country.name, country.code)}
                >
                  <span className="mr-2">{country.code}</span>
                  <span>{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryDropdown; 