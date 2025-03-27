import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft,Info} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';


const PageContainer = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
      <button
    onClick={() => navigate('/itinerary-details')}
  >
    <ArrowLeft className="w-6 h-6" />
  </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
};

const BrokerDetail = () => {
  const { selectedCompanyDetails, loading, error } = useItinerary();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price ? parseFloat(price).toLocaleString('en-US') : '0';
  };

  const shouldShowFuelStopWarning = (company) => {
    if (!company.tailInfo) return false;
    return company.tailInfo.some((aircraft) => aircraft.fuelStop === true || aircraft.fuelStop === 'true');
  };

  const renderCompanyCard = (company) => {
   

    return (
      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full mb-3">
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col items-start">
              <div className="mb-2">
                {company.logo && company.logo.length > 0 ? (
                  <img src={company.logo[0]} alt={company.name} className="w-22 h-16 object-contain" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full">
                    <Plane size={20} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {company.certificates && company.certificates.length > 0 ? (
                  company.certificates.map((cert, index) => (
                    <img
                      key={index}
                      src={cert.logo}
                      alt={cert.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ))
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <h2 className="font-bold text-lg text-gray-800 mb-2">{company.name}</h2>
              <p className="text-xs text-gray-600 mb-2">
                {company.city}
                {company.country ? `, ${company.country}` : ''}
              </p>

              
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

          
          {/* Main Content: Fleet and Aircraft Information */}
          <div className="flex justify-between">
            {/* Left Side: Fleet Size and Roles */}
            <div className="text-sm">
              <p className="font-medium">Fleet Size: <span>{company.fleet || 0}</span></p>
              <div className="mt-2">
                <p className="font-medium">Aircraft and Roles</p>
                <p className="text-gray-600">{company.tags || ''}</p>
              </div>
    
              {/* Price Section */}
              {(company.currency || company.computedPrice) && (
                
<div className="mt-2">
  <div className="flex items-center space-x-1 text-xs text-gray-500">
    <p>Price from</p>
    <Info className="w-4 h-4 text-gray-700" />
  </div>
  <p className="text-xl font-bold">
    {company.currency || 'USD'} {formatPrice(company.computedPrice || 0)}
  </p>
</div>
              )}
            </div>
    
            {/* Right Side: Aircraft Types & Fuel Stop Warning */}
            <div className="text-sm text-right mt-4">
              <p className="font-medium">Aircraft Types</p>
              <p className="text-gray-600">
                {[...new Set(company.tailInfo?.map(aircraft => aircraft.aircraft_Type_Name))].join(", ")}
              </p>
    
              {/* Fuel Stop Warning */}
              {shouldShowFuelStopWarning(company) && (
                <p className="text-red-500 text-xs mt-3">
                  One or more of these aircraft types may require a fuel stop.
                </p>
              )}
            </div>
          </div>
    
          {/* Connect Button */}
          <div className="mt-2 flex justify-end">
            <button className="bg-black text-white px-6 py-2 rounded-sm text-sm">Connect</button>
          </div>
        </div>
      </div>
    );
    
  };

  if (loading || !selectedCompanyDetails || selectedCompanyDetails.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorDisplay error={error} onRetry={() => navigate('/itinerary')} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h1 className="font-bold text-2xl text-gray-800">Available Charter Options</h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            Showing {selectedCompanyDetails.length} companies
          </div>
        </div>

        <div className="space-y-4">
          {selectedCompanyDetails.map((company) => renderCompanyCard(company))}
        </div>
      </div>
    </PageContainer>
  );
};

export default BrokerDetail;