import PropTypes from 'prop-types';
import { MessageSquareOff , Zap } from 'lucide-react';

const BaseCardDetails = ({ company }) => {
  // Extract data from the company object safely with defaults
  const name = company?.name || '';
  const fleet = company?.fleet || 0;
  const city = company?.city || '';
  const trustScore = company?.rankOverall || null;
  const certificates = company?.certificates || [];
  const userCount = company?.userCount || 0;
  const responseRate = company?.responseRate || 0;
  
  // Check if company has valid data
  if (!company) return null;

  // Determine icons to show based on conditions
  const showNoChat = userCount === 0;
  const showFlash = responseRate > 0.5;

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 px-3">
        <div className="text-blue-600 text-xs">{name}</div>
      </td>
      <td className="py-2 px-3">
        <div className="font-medium text-black text-xs">{city}</div>
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
      <td className="py-2 px-3">
        <div className="text-xs font-medium text-black">{fleet}</div>
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
              <MessageSquareOff  size={18} className="text-black" strokeWidth={2} />
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
  );
};

BaseCardDetails.propTypes = {
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
    responseRate: PropTypes.number
  })
};

export default BaseCardDetails;
