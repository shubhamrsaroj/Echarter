import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { Plane, PlaneTakeoff, PlaneLanding, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { getStarRating, getRankLabel, getRankColorClass, StarRating } from '../common/RankUtils';

const PageContainer = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/itinerary')}
          className="flex items-center text-blue-700 hover:text-blue-900 font-medium bg-white px-4 py-2 rounded-md shadow-sm border border-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Itinerary
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
};

const DateAdjustmentDetail = () => {
  const { selectedCompanyDetails, loading, error } = useItinerary();

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderCompanyCard = (company) => {
    const haves = company.haves && company.haves.length > 0 ? company.haves[0] : null;
    const starRating = getStarRating(company.rankOverall);
    const rankLabel = getRankLabel(company.rankOverall);

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
              <p className="text-xs text-gray-600">{company.city}, {company.country || 'N/A'}</p>

              {/* Rating section with stars, label, and bar */}
              <div className="flex flex-col items-end">
                <StarRating rating={starRating} />
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Rating:{' '}
                  <span className={`${getRankColorClass(company.rankOverall)} text-white px-2 py-0.5 rounded`}>
                    {rankLabel}
                  </span>
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`${getRankColorClass(company.rankOverall)} h-full rounded-full`}
                    style={{ width: `${company.rankOverall || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Certificate section */}

<div className="flex space-x-2 mb-3">
  {company.certificates && company.certificates.length > 0 ? (
    company.certificates.map((cert, index) => (
      <div key={index} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-gray-600 text-xs">{cert.name || `C${index + 1}`}</span>
      </div>
    ))
  ) : null} {/* Add a fallback to avoid syntax errors */}
</div>


          {/* Main content */}
          <div className="flex items-start">
            {/* Aircraft Image with price */}
            {haves && haves.aircraftImage && (
              <div className="mr-4 flex flex-col">
                <img
                  src={haves.aircraftImage}
                  alt="Aircraft"
                  className="w-36 h-32 object-cover rounded-md"
                />
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700">Price from</p>
                  <p className="text-base font-bold text-gray-800">
                    {haves.currency || 'USD'} {formatPrice(haves.computedPrice || 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Aircraft and Route Details */}
            <div className="flex-1 ml-1">
              {haves && (
                <div>
                  <h3 className="font-semibold text-md text-gray-800 mb-1">{haves.acType}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {haves.availType || 'One Way'} - {haves.acCat || 'Unknown Category'}
                  </p>
                  <div className="flex items-center mb-2">
                    <PlaneTakeoff className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{haves.fromCity || 'Unknown Departure'}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <PlaneLanding className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{haves.toCity || 'Unknown Destination'}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {haves.dateFrom || 'N/A'} - {haves.dateTo || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Seats: {haves.seats || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Connect button */}
          <div className="mt-3 flex justify-end">
            <button className="bg-black text-white px-4 py-1.5 rounded text-sm font-medium">Connect</button>
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