import PropTypes from 'prop-types';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MatchCardDetails = ({ company }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!company) return null;

  // Extract data from the company object
  const {
    name,
    logo,
    haves = []
  } = company;

  if (haves.length === 0) return null;

  return (
    <div className="border-t border-gray-200">
      {/* Company Header - Simplified */}
      <div 
        className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >     
      <div className=" text-blue-600 text-sm">{name}</div>
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
              {haves.map((have, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <div className="font-medium text-gray-900 text-xs">{have.acType || 'N/A'}</div>
                    {have.registration && (
                      <div className="text-xs text-blue-600">{have.registration}</div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-gray-900 text-xs">{have.fromCity || 'N/A'}</div>
                    {have.fromAirport && (
                      <div className="text-xs text-black">{have.fromAirport}</div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-gray-900 text-xs">{have.toCity || 'N/A'}</div>
                    {have.toAirport && (
                      <div className="text-xs text-black">{have.toAirport}</div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900">{formatDate(have.dateFrom)}</td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900">{formatDate(have.dateTo)}</td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900">{have.seats || 'N/A'}</td>
                  <td className="py-2 px-3 text-xs font-medium text-green-600">{have.price || 'N/A'}</td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                </tr>
              ))}
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
    return dateString; // Return original string if parsing fails
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
    haves: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        dateFrom: PropTypes.string,
        dateTo: PropTypes.string,
        acType: PropTypes.string,
        fromCity: PropTypes.string,
        toCity: PropTypes.string,
        fromAirport: PropTypes.string,
        toAirport: PropTypes.string,
        seats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.string,
        availType: PropTypes.string,
        registration: PropTypes.string
      })
    )
  })
};

export default MatchCardDetails;