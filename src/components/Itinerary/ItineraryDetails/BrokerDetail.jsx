import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft,Info,ListCollapse} from 'lucide-react';
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
};

const BrokerDetail = () => {
  const { selectedCompanyDetails, loading, error } = useItinerary();
  const navigate = useNavigate();
  const renderCompanyCard = (company) => {
    return (
      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-3 p-4">
        {/* Top Section: Logo + Info */}
        <div className="flex gap-6 items-start">
          {/* Logo Section - Left (40%) with fixed size */}
          <div className="flex-[0.4] w-40 h-40 relative rounded-md overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
            {company.logo && company.logo.length > 0 ? (
              <img
                src={company.logo[0]}
                alt={company.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Plane size={40} className="text-gray-400" />
            )}
          </div>
  
         {/* Company Info - Right (60%) - Right Aligned */}
         <div className="flex-[0.6] flex flex-col justify-start ml-auto text-right">
          <h2 className="font-bold text-lg text-black">{company.name}</h2>
          <p className="text-md text-gray-600 mt-2">
            {company.city}
            {company.country ? `, ${company.country}` : ''}
          </p>
          <div className="flex items-center space-x-4 mt-4 justify-end">
            <div className="w-36 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-yellow-500 h-full rounded-full"
                style={{ width: `${company.rankOverall || 0}%` }}
              />
            </div>
            <p className="text-md font-semibold text-gray-600">{company.rankOverall}</p>
          </div>
          <div className="flex items-center space-x-1 text-md text-gray-600 mt-2 justify-end mr-2">
            <p>Trust Score</p>
            <Info className="w-4 h-4" />
          </div>
        </div>
      </div>
  
        {/* Main Content Section */}
        <div className="p-4">
          <div className="flex flex-col relative">
            {/* Right Side: Details Link */}
            <div className="absolute top-0 right-0 text-md flex-shrink-0 flex flex-col items-center">
              <ListCollapse className="w-5 h-5 text-black" />
              <p className="text-black">Details</p>
            </div>
            
            {/* Certificates Section */}
            {company.certificates && company.certificates.length > 0 && (
              <div className="mb-3 flex space-x-2">
                {company.certificates.map((cert, index) => (
                  <img key={index} src={cert.logo} alt={cert.name} className="w-10 h-10 rounded-full" />
                ))}
              </div>
            )}
  
            {/* Main Content: Roles, Fleet Size, Aircraft Types */}
            <div className="flex items-start pr-16">
              <div className="text-md w-full">
                <p className="font-bold text-lg">Headline</p>
                <p className="text-gray-600">{company.hedline || ''}</p>
                <p className="font-medium mt-2">Description <span>{company.description ||''}</span></p>
              </div>
            </div>
  
            {/* Connect Button */}
            <div className="mt-4 flex justify-end">
              <button className="bg-black text-white px-6 py-2 rounded-sm text-md">Connect</button>
            </div>
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
          <h1 className="font-bold text-3xl text-black">Broker</h1>
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