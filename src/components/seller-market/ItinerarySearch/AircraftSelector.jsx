// import { ChevronDown, Search } from 'lucide-react';
// import PropTypes from 'prop-types';
// import { useState } from 'react';

// const AircraftSelector = ({ 
//   id, 
//   selectedAircraft, 
//   showDropdown, 
//   toggleDropdown, 
//   aircraftTypes, 
//   loading, 
//   error,
//   onSelectAircraft,
//   hasError 
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Filter aircraft types based on search term
//   const filteredAircraftTypes = Array.isArray(aircraftTypes) 
//     ? aircraftTypes.filter(aircraft => 
//         aircraft.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : [];

//   return (
//     <div className="relative">
//       <div 
//         className={`w-full p-2 border ${hasError ? 'border-red-600' : 'border-gray-300'} rounded-lg bg-white text-gray-800 flex justify-between items-center cursor-pointer`}
//         onClick={() => toggleDropdown(id)}
//       >
//         <span className={`truncate ${!selectedAircraft ? 'text-gray-500' : ''}`}>
//           {selectedAircraft || "Select Aircraft"}
//         </span>
//         <ChevronDown className="w-4 h-4" />
//       </div>
//       {showDropdown === id && (
//         <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
//           <div className="p-2 border-b border-gray-200">
//             <div className="flex items-center gap-2">
//               <Search className="w-4 h-4 text-gray-400" />
//               <input 
//                 type="text"
//                 className="w-full border-none outline-none text-sm text-gray-800 placeholder-gray-500"
//                 placeholder="Search aircraft..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onClick={(e) => e.stopPropagation()}
//                 autoFocus
//               />
//             </div>
//           </div>
//           <div className="max-h-[200px] overflow-y-auto">
//             {loading ? (
//               <div className="p-2 text-center text-gray-500">Loading...</div>
//             ) : error ? (
//               <div className="p-2 text-center text-red-500">{error}</div>
//             ) : filteredAircraftTypes.length > 0 ? (
//               filteredAircraftTypes.map((aircraft) => (
//                 <div 
//                   key={aircraft.id} 
//                   className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onSelectAircraft(id, aircraft);
//                   }}
//                 >
//                   <div className="font-medium">{aircraft.name}</div>
//                   {(aircraft.slp !== undefined || aircraft.cons !== undefined) && (
//                     <div className="text-sm text-gray-600">
//                       {aircraft.slp !== undefined && (
//                         <span>SLP: {aircraft.slp?.toFixed(4) || 'N/A'}</span>
//                       )}
//                       {aircraft.cons !== undefined && (
//                         <span className="ml-3">CONS: {aircraft.cons?.toFixed(4) || 'N/A'}</span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="p-2 text-center text-gray-500">
//                 {searchTerm ? 'No matching aircraft found' : 'No aircraft available'}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// AircraftSelector.propTypes = {
//   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   selectedAircraft: PropTypes.string,
//   showDropdown: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   toggleDropdown: PropTypes.func.isRequired,
//   aircraftTypes: PropTypes.arrayOf(PropTypes.shape({
//     id: PropTypes.number,
//     name: PropTypes.string,
//     slp: PropTypes.number,
//     cons: PropTypes.number
//   })),
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   onSelectAircraft: PropTypes.func.isRequired,
//   hasError: PropTypes.bool
// };

// export default AircraftSelector; 



import { ChevronDown, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AircraftSelector = ({ 
  id, 
  selectedAircraft, 
  showDropdown, 
  toggleDropdown, 
  aircraftTypes, 
  loading, 
  error,
  onSelectAircraft,
  hasError 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter aircraft types based on search term and ensure slp and cons are not null
  const filteredAircraftTypes = Array.isArray(aircraftTypes) 
    ? aircraftTypes
        .filter(aircraft => 
          aircraft.slp !== null && 
          aircraft.slp !== undefined && 
          aircraft.cons !== null && 
          aircraft.cons !== undefined
        )
        .filter(aircraft => 
          aircraft.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  return (
    <div className="relative">
      <div 
        className={`w-full p-2 border ${hasError ? 'border-red-600' : 'border-gray-300'} rounded-lg bg-white text-gray-800 flex justify-between items-center cursor-pointer`}
        onClick={() => toggleDropdown(id)}
      >
        <span className={`truncate ${!selectedAircraft ? 'text-gray-500' : ''}`}>
          {selectedAircraft || "Select Aircraft"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </div>
      {showDropdown === id && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                className="w-full border-none outline-none text-sm text-gray-800 placeholder-gray-500"
                placeholder="Search aircraft..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {loading ? (
              <div className="p-2 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-2 text-center text-red-500">{error}</div>
            ) : filteredAircraftTypes.length > 0 ? (
              filteredAircraftTypes.map((aircraft) => (
                <div 
                  key={aircraft.id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAircraft(id, aircraft);
                  }}
                >
                  <div className="font-medium">{aircraft.name}</div>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">
                {searchTerm ? 'No matching aircraft found' : 'No aircraft available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

AircraftSelector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  selectedAircraft: PropTypes.string,
  showDropdown: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  toggleDropdown: PropTypes.func.isRequired,
  aircraftTypes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    slp: PropTypes.number,
    cons: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelectAircraft: PropTypes.func.isRequired,
  hasError: PropTypes.bool
};

export default AircraftSelector;