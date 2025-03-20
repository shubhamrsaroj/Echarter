import React, { useEffect } from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';
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

const BaseDetail = () => {
  const {
    selectedCompanyDetails,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    changePage,
    setPageSize,
  } = useItinerary();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price ? parseFloat(price).toLocaleString('en-US') : '0';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      changePage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    changePage(1, newSize);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const renderPaginationControls = () => (
    <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Show:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span className="text-sm text-gray-600">per page</span>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 mx-1 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 mx-1 rounded ${
                  currentPage === page ? 'bg-blue-700 text-white' : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );

  const shouldShowFuelStopWarning = (company) => {
    if (!company.tailInfo) return false;
    return company.tailInfo.some((aircraft) => aircraft.fuelStop === true || aircraft.fuelStop === 'true');
  };

  const renderCompanyCard = (company) => {
    const starRating = getStarRating(company.rankOverall);
    const rankLabel = getRankLabel(company.rankOverall);

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

          {(company.currency || company.computedPrice) && (
            <div className="mb-2">
              <p className="text-xs text-gray-500">Price from</p>
              <p className="text-xl font-bold">
                {company.currency || 'USD'} {formatPrice(company.computedPrice || 0)}
              </p>
            </div>
          )}

          <div className="mb-2">
            <p className="text-xs">
              <span className="font-medium">Fleet Size: </span>
              {company.fleet || 0}
            </p>
          </div>

          <div className="mb-2">
            <p className="text-xs font-medium">Categories and Roles</p>
            <p className="text-xs">{company.tags || ''}</p>
          </div>

          <div className="mb-2">
            <p className="text-xs font-medium">Aircraft Types</p>
            <p className="text-xs">
              {company.tailInfo &&
                company.tailInfo.map((aircraft, index) => (
                  <span key={index}>
                    {aircraft.aircraft_Type_Name}
                    {index < company.tailInfo.length - 1 ? ', ' : ''}
                  </span>
                ))}
            </p>
          </div>

          {shouldShowFuelStopWarning(company) && (
            <div className="text-red-500 text-xs mb-2">
              One or more of these types may require a fuel stop.
            </div>
          )}

          <div className="mt-2 flex justify-end">
            <button className="bg-black text-white px-4 py-1 rounded-md text-sm">Connect</button>
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

        {totalPages > 1 && renderPaginationControls()}
      </div>
    </PageContainer>
  );
};

export default BaseDetail;