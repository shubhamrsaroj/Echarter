import PropTypes from 'prop-types';
import AircraftSelector from './AircraftSelector';
import { updateTooltipTimes, calculateTooltipFlightData, formatUTCOffset } from './tooltipCalculations';

const FlightDetailsTooltip = ({
  tooltipRef,
  detailId,
  selectedAircraft,
  showAircraftDropdown,
  handleAircraftDropdown,
  aircraftTypes,
  aircraftLoading,
  aircraftError,
  onSelectAircraft,
  fromDateTime,
  toDateTime,
  onTimeChange,
  detail,
  dateTimeMode
}) => {
  // Calculate initial distance when tooltip opens
  const { distance } = calculateTooltipFlightData(
    detail.fromCoordinates,
    detail.toCoordinates,
    null // Pass null for aircraft to only calculate distance
  );

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Not set";
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      ref={tooltipRef}
      className="absolute z-50 bg-[#F3F3F3] border border-gray-200 rounded-lg shadow-lg p-4 w-[700px] -right-2 top-12"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute -top-2 right-4 w-4 h-4 bg-[#F3F3F3] border-t border-l border-gray-200 transform rotate-45"></div>
      <div className="space-y-4">
        {/* Aircraft Selection */}
        <div className="w-full">
          <div className="w-[250px] mx-auto text-left">
            <AircraftSelector
              id={detailId}
              selectedAircraft={selectedAircraft}
              showDropdown={showAircraftDropdown ? detailId : null}
              toggleDropdown={handleAircraftDropdown}
              aircraftTypes={aircraftTypes}
              loading={aircraftLoading}
              error={aircraftError}
              onSelectAircraft={onSelectAircraft}
              label="Select Aircraft Type"
            />
          </div>
        </div>

        {/* Flight Information Display */}
        <div className="bg-[#F3F3F3] p-4 rounded-xl">
          <div className="flex flex-col items-center">
            {/* Distance and Aircraft labels at the top */}
            <div className="flex justify-between w-full mb-0">
              <div className="pl-[60px]">
                <span className="text-sm font-bold text-black ml-28">{distance}</span>
              </div>
              <div className="pr-[60px]">
                <span className="text-sm font-bold text-black mr-28">{selectedAircraft || '---'}</span>
              </div>
            </div>
            
            {/* Date & Time labels */}
            <div className="flex justify-between w-full -mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Departure Date & Time</label>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Arrival Date & Time</label>
              </div>
            </div>
            
            {/* Flight Time Visualization with Date/Time display in same row */}
            <div className="flex items-center justify-between w-full">
              {/* Departure Date/Time aligned with line */}
              <div className="text-md font-medium text-black">
                {formatDate(fromDateTime)}
              </div>
              
              {/* Flight Time Input */}
              <div className="flex items-center">
                <div className="w-[80px] h-[2px] bg-black"></div>
                <div className="w-[100px] h-12 border-2 border-black rounded-lg flex items-center justify-center relative bg-white">
                  <input
                    type="text"
                    value={detail.flightTime ? detail.flightTime.replace(' hrs', '') : '--'}
                    onChange={(e) => {
                      let newValue = e.target.value;
                      
                      // Don't process if it's the default placeholder
                      if (newValue === '--') {
                        const updatedDetail = updateTooltipTimes(
                          detail,
                          detail.fromDateTime,
                          null,
                          '-- hrs',
                          detail.aircraftData
                        );
                        onTimeChange(detailId, 'flightTime', '-- hrs', updatedDetail);
                        return;
                      }

                      // Only allow numbers and one colon
                      newValue = newValue.replace(/[^\d:]/g, '');
                      
                      // Handle colon input
                      if (newValue.includes(':')) {
                        const parts = newValue.split(':');
                        if (parts.length > 2) {
                          newValue = `${parts[0]}:${parts[1]}`;
                        }
                        // Limit minutes to 2 digits
                        if (parts[1] && parts[1].length > 2) {
                          newValue = `${parts[0]}:${parts[1].slice(0, 2)}`;
                        }
                        // Ensure minutes are less than 60
                        if (parts[1] && parseInt(parts[1]) >= 60) {
                          newValue = `${parts[0]}:59`;
                        }
                      }
                      // Auto-add colon after hour input
                      else if (newValue.length > 0 && !newValue.includes(':')) {
                        if (newValue.length > 2) {
                          newValue = `${newValue.slice(0, 2)}:${newValue.slice(2, 4)}`;
                        }
                      }

                      const formattedTime = `${newValue} hrs`;
                      const updatedDetail = updateTooltipTimes(
                        detail,
                        dateTimeMode === 'departure' ? detail.fromDateTime : null,
                        dateTimeMode === 'arrival' ? detail.toDateTime : null,
                        formattedTime,
                        detail.aircraftData
                      );
                      onTimeChange(detailId, 'flightTime', formattedTime, updatedDetail);
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '--') {
                        e.target.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.value = '--';
                        const updatedDetail = updateTooltipTimes(
                          detail,
                          detail.fromDateTime,
                          null,
                          '-- hrs',
                          detail.aircraftData
                        );
                        onTimeChange(detailId, 'flightTime', '-- hrs', updatedDetail);
                      }
                    }}
                    className="text-sm font-medium text-black text-center w-[calc(100%-30px)] bg-transparent outline-none"
                    placeholder="--"
                  />
                  <span className="text-sm font-medium text-black absolute right-2">hrs</span>
                </div>
                <div className="w-[80px] h-[2px] bg-black"></div>
              </div>
              
              {/* Arrival Date/Time aligned with line */}
              <div className="text-md font-medium text-black text-right">
                {formatDate(toDateTime)}
              </div>
            </div>

            {/* UTC Offset Display */}
            <div className="flex justify-between w-full mt-0">
              <div className="text-center">
                <span className="text-md text-black">{formatUTCOffset(detail.fromShiftMins)}</span>
              </div>
              <div className="text-center">
                <span className="text-md text-black">{formatUTCOffset(detail.toShiftMins)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FlightDetailsTooltip.propTypes = {
  tooltipRef: PropTypes.object.isRequired,
  detailId: PropTypes.number.isRequired,
  selectedAircraft: PropTypes.string,
  showAircraftDropdown: PropTypes.bool,
  handleAircraftDropdown: PropTypes.func.isRequired,
  aircraftTypes: PropTypes.array.isRequired,
  aircraftLoading: PropTypes.bool.isRequired,
  aircraftError: PropTypes.string,
  onSelectAircraft: PropTypes.func.isRequired,
  fromDateTime: PropTypes.instanceOf(Date),
  toDateTime: PropTypes.instanceOf(Date),
  onTimeChange: PropTypes.func.isRequired,
  detail: PropTypes.object.isRequired,
  dateTimeMode: PropTypes.string
};

export default FlightDetailsTooltip; 