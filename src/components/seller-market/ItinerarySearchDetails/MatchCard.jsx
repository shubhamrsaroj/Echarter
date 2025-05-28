import { Info } from 'lucide-react';
import PropTypes from 'prop-types';

const MatchCard = ({ match = {} }) => {
  // If ids array is empty, don't render the component
  if (!match.ids || match.ids.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-b-3 p-6 relative">
      <div className="absolute top-4 right-4 text-right">
        <h3 className="font-semibold text-xl text-black">{match.title}</h3>
        <div className="flex items-center justify-end mt-2">
          <button 
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <Info className="text-gray-700 ml-1" size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center mb-2">
        <img
          src={match.image}
          alt="Match"
          className="w-24 h-24 rounded-full border border-gray-200 object-cover"
        />
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="bg-[#c1ff72] py-1 px-3 rounded-lg inline-block">
          <span className="font-medium text-black text-sm">
            {match.count} Nearby
          </span>
        </div>
        <button 
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all hover:bg-gray-800"
        >
          {match.button}
        </button>
      </div>
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
  })
};

export default MatchCard;