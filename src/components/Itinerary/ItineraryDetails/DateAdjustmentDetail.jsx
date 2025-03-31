import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { Plane, PlaneTakeoff, PlaneLanding, CalendarClock, ArrowLeft, TicketsPlane, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const PageContainer = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate('/itinerary-details')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
};

const DateAdjustmentDetail = ({ setHoveredFlightCoords }) => {
  const { selectedCompanyDetails, loading, error } = useItinerary();

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

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
      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full mb-3">
        <div className="flex flex-col">
          {/* Header section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              {company.logo && company.logo.length > 0 ? (
                <img src={company.logo[0]} alt={company.name} className="w-22 h-16 object-contain" />
              ) : (
                <div className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full">
                  <Plane size={18} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <h2 className="font-semibold text-base text-gray-800 mb-2">{company.name || 'Unnamed Company'}</h2>
              <p className="text-xs text-gray-700">{company.city}, {company.country || 'N/A'}</p>

              {/* Rating section */}
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full"
                      style={{ width: `${company.rankOverall || 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold">{company.rankOverall}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-700">
                  <p>Trust Score</p>
                  <Info className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Certificate section */}
          <div className="flex space-x-2 mb-3">
            {company.certificates?.length > 0 &&
              company.certificates.map((cert, index) => (
                <div key={index} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs">{cert.name || `C${index + 1}`}</span>
                </div>
              ))}
          </div>

          {/* Main content - Render up to 2 haves */}
          <div className="flex flex-col gap-4">
            {havesList.length > 0 ? (
              havesList.map((haves, index) => (
                <div
                  key={index}
                  className="flex items-start hover:bg-gray-200 p-2 rounded-md"
                  onMouseEnter={() => handleMouseEnter(haves)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Left Section */}
                  <div className="flex-1 flex items-start">
                    <div className="mr-4">
                      {haves && haves.aircraftImage ? (
                        <img
                          src={haves.aircraftImage}
                          alt="Aircraft"
                          className="w-36 h-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-36 h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image Available</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      {haves && (
                        <div>
                          <div className="flex flex-col mb-2">
                            <div className="flex items-center">
                              <PlaneTakeoff className="w-5 h-5 text-gray-700 mr-2" />
                              <span className="text-sm text-gray-700">{haves.fromCity || 'Unknown Departure'}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <PlaneLanding className="w-5 h-5 text-gray-700 mr-2" />
                              <span className="text-sm text-gray-700">{haves.toCity || 'Unknown Destination'}</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <TicketsPlane className="w-5 h-5 text-gray-700 mr-2" />
                            <span className="text-sm text-gray-700">Seats: {haves.seats || 'N/A'}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <CalendarClock className="w-5 h-5 text-gray-700 mr-2" />
                            <span className="text-sm text-gray-700">
                              {haves.dateFrom
                                ? new Date(haves.dateFrom).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                              {' - '}
                              {haves.dateTo
                                ? new Date(haves.dateTo).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="w-1/3 flex flex-col items-end">
                    {haves && (
                      <div className="text-right">
                        <h3 className="font-semibold text-md text-gray-800 mb-1">{haves.acType}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {haves.availType || 'One Way'} - {haves.acCat || 'Unknown Category'}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-700">Price from</p>
                          <p className="text-base font-bold text-gray-800">
                            {haves.currency || 'USD'} {formatPrice(haves.computedPrice || 0)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No aircraft available</p>
            )}
          </div>

          {/* Connect button */}
          <div className="mt-3 flex justify-end">
            <button className="bg-black text-white px-6 py-2 rounded-sm text-sm">Connect</button>
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
        <div className="text-center py-4 text-sm">No date adjustment companies found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h1 className="font-bold text-2xl text-gray-800">Date Adjustment Companies</h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            Showing {selectedCompanyDetails.length} companies
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