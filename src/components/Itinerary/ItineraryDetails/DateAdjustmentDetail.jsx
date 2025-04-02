import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { Plane, PlaneTakeoff, PlaneLanding, CalendarClock, ArrowLeft, TicketsPlane, Info,ListCollapse } from 'lucide-react';

import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const PageContainer = ({ children }) => {
    
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white -mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
}

const DateAdjustmentDetail = ({ setHoveredFlightCoords }) => {
  const { selectedCompanyDetails, loading, error } = useItinerary();

 
  const handleMouseEnter = (haves) => {
    const coords = {
      fromLat: haves.fromLat,
      fromLong: haves.fromLong,
      toLat: haves.toLat,
      toLong: haves.toLong,
      fromCity: haves.fromCity || 'Unknown Departure',
      toCity: haves.toCity || 'Unknown Destination',
    };
    setHoveredFlightCoords(coords);
  };

  const handleMouseLeave = () => {
    setHoveredFlightCoords(null);
  };

  const renderCompanyCard = (company) => {
    const havesList = company.haves && company.haves.length > 0 ? company.haves.slice(0, 2) : [];
  
    return (
      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full mb-4">
        <div className="flex flex-col">
          {/* Header section with hero image/aircraft */}
          <div className="w-full mb-3">
            <div className="h-48 w-full bg-cover bg-center rounded-lg overflow-hidden relative border border-gray-300">
            {havesList.length > 0 && havesList[0].aircraftImage ? (
           <img
              src={havesList[0].aircraftImage}
              alt={company.name}
              className="w-full h-full object-cover"
               />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <span className="text-gray-400">No image</span>
               </div>
             )}
              
              {/* Overlay for Company Info - Top right */}
              <div className="absolute top-0 right-0 p-3 text-right">
                <h2 className="font-bold text-base text-black">{company.name || 'NA'}</h2>
                <p className="text-sm text-black mt-1">{company.city || 'NA'}, {company.country || 'NA'}</p>
                <div className="flex items-center space-x-1 mt-1 justify-end">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full"
                      style={{ width: `${company.rankOverall || 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-black">{company.rankOverall}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-black justify-end mt-1">
                  <p>Trust Score</p>
                  <Info className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
  
          {/* Certificate section with Details button */}
          <div className="flex justify-between items-center mb-3">
            {/* Certificates on the left */}
            <div className="flex space-x-1">
              {company.certificates?.length > 0 &&
                company.certificates.map((cert, index) => (
                  <div key={index} className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">{cert.name || `C${index + 1}`}</span>
                  </div>
                ))}
            </div>
            
            {/* Details button */}
              <div className="text-xs flex flex-col items-center">
               <ListCollapse className="w-4 h-4 text-black" />
              <p className="text-black">Details</p>
            </div>
          </div>
  
          {/* Aircraft details cards - TALLER VERSION */}
          <div className="flex flex-col gap-2 w-full">
            {havesList.length > 0 &&
              havesList.map((haves, index) => (
                <div
                  key={index}
                  className="flex items-start bg-gray-100 hover:bg-gray-100 p-4 rounded-md w-full"
                  onMouseEnter={() => handleMouseEnter(haves)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Left Section: Aircraft type */}
                  <div className="w-1/3 flex flex-col items-start mr-8">
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-black">{haves.acType}</h3>
                      <p className="text-sm font-bold  text-black mt-2">
                        {haves.availType || 'One Way'} - {haves.acCat || 'Unknown'}
                      </p>
                    </div>
                  </div>
  
                  {/* Right Section: Flight details */}
                  <div className="flex-1 flex flex-col ml-4">
                    <div>
                      <div className="flex flex-col mb-2">
                        <div className="flex items-center">
                          <PlaneTakeoff className="w-4 h-4 text-gray-700 mr-1" />
                          <span className="text-xs text-gray-700">{haves.fromCity || 'Unknown Departure'}</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <PlaneLanding className="w-4 h-4 text-gray-700 mr-1" />
                          <span className="text-xs text-gray-700">{haves.toCity || 'Unknown Destination'}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <TicketsPlane className="w-4 h-4 text-gray-700 mr-1" />
                        <span className="text-xs text-gray-700">Seats: {haves.seats || 'N/A'}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <CalendarClock className="w-4 h-4 text-gray-700 mr-1" />
                        <span className="text-xs text-gray-700">
                          {haves.dateFrom ? new Date(haves.dateFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                          {' - '}
                          {haves.dateTo ? new Date(haves.dateTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
  
          {/* Connect button */}
          <div className="mt-4 flex justify-end">
            <button className="bg-black text-white px-4 py-1 rounded text-md" style={{ borderRadius: '3px' }}>Connect</button>
          </div>
        </div>
      </div>
    );
  };



  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorDisplay error={error} />
      </PageContainer>
    );
  }

  if (!selectedCompanyDetails || selectedCompanyDetails.length === 0) {
    return (
      <PageContainer>
        <div className="text-center py-4 text-sm">No Flexi Legs found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h1 className="font-bold text-3xl text-black">Flexi Legs</h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            Showing {selectedCompanyDetails.length} Flexi_Legs
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {selectedCompanyDetails.map((company) => renderCompanyCard(company))}
        </div>
      </div>
    </PageContainer>
  );
};

export default DateAdjustmentDetail;