
import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, ListCollapse, Info } from 'lucide-react';
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
    selectedBaseOption,
  } = useItinerary();
  const navigate = useNavigate();

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

  const renderCompanyCard = (company) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-3 p-4">
        {/* Logo Section */}
        <div className="relative rounded-md overflow-hidden">
          <div className="h-60 bg-cover bg-center rounded-lg overflow-hidden relative border border-gray-300">
            {company.logo && company.logo.length > 0 ? (
              <img
                src={company.logo[0]}
                alt={company.name}
                className="w-30 h-30 object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <Plane size={20} className="text-gray-400" />
              </div>
            )}
  
            {/* Overlay for Company Name, Location, Trust Score (Right Aligned) */}
            <div className="absolute top-0 right-0 p-4 text-right">
              <h2 className="font-bold text-lg text-black mt-2">{company.name}</h2>
              <p className="text-md text-gray-600 mt-2">{company.city}, {company.country}</p>
              <div className="flex items-center space-x-2 mt-2 justify-end">
                <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full"
                    style={{ width: `${company.rankOverall || 0}%` }}
                  />
                </div>
                <p className="text-md font-semibold text-gray-600 mt-2">{company.rankOverall}</p>
              </div>
              <div className="flex items-center space-x-1 text-md text-gray-600 justify-end mt-2">
                <p>Trust Score</p>
                <Info className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
  
        {/* Main Content Section */}
        <div className="p-4">
          <div className="flex flex-col relative">
            {/* Certificates - Dynamic Section */}
            {company.certificates && company.certificates.length > 0 ? (
              <div className="flex space-x-2 mb-3 min-h-[40px]">
                {company.certificates.map((cert, index) => (
                  <img
                    key={index}
                    src={cert.logo}
                    alt={cert.name}
                    className="w-10 h-10 rounded-full"
                  />
                ))}
              </div>
            ) : <div className="mb-3"></div>}
  
            {/* Right Side: Details - Fixed Position */}
            <div className="absolute top-4 right-0 text-md text-right flex-shrink-0 flex flex-col items-center">
              <ListCollapse className="w-5 h-5 text-black" />
              <p className="text-black">Details</p>
            </div>
  
            {/* Main Content: Roles, Aircraft Types */}
            <div className="flex justify-between items-start pr-16">
              {/* Left Side: Roles, Aircraft Types */}
              <div className="text-md">
                <div className="mt-2">
                  <p className="font-bold text-lg">Roles</p>
                  <p className="text-gray-600">{company.roles || ''}</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium">Aircraft Types</p>
                  <p className="text-gray-600">{company.typeName}</p>
                </div>
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
          <h1 className="font-bold text-2xl text-gray-800">
            {selectedBaseOption?.category || "Available Options"}
          </h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            Showing {selectedCompanyDetails.length} {selectedBaseOption?.category}
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