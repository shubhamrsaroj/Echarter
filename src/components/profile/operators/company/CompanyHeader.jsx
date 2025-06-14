import React from 'react';
import { Tag } from 'primereact/tag';

const CompanyHeader = ({ company, companyId }) => {
  // Handle case where company is undefined or null
  if (!company) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
        <div className="text-center">
          <i className="pi pi-building text-gray-300 text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-700">Company Profile</h1>
          <p className="text-gray-500 mt-2">Loading company information...</p>
        </div>
      </div>
    );
  }
  
  const { 
    name, 
    logo, 
    city, 
    email, 
    phone, 
    website, 
    roles, 
    headline,
    rankOverall,
    certificates
  } = company;
  
  // Log company data for debugging
  console.log('CompanyHeader rendering with data:', { name, logo, city, website, companyId });
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Company Logo */}
          <div className="w-full md:w-48 h-32 md:h-48 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
            {logo ? (
              <img 
                src={logo} 
                alt={`${name} logo`} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(name || 'Company');
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <i className="pi pi-building text-gray-300 text-5xl"></i>
              </div>
            )}
          </div>
          
          {/* Company Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <div className="bg-blue-500 text-white h-1.5 w-12 rounded-full"></div>
              <span className="text-blue-500 text-sm">{rankOverall || 'NN'}%</span>
              {roles && (
                <Tag 
                  value={roles} 
                  className="bg-indigo-100 text-indigo-800 text-xs" 
                />
              )}
              {certificates && certificates.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {certificates.map((cert, index) => (
                    <Tag 
                      key={cert.id || index}
                      value={cert.name} 
                      className="bg-green-100 text-green-800 text-xs" 
                    />
                  ))}
                </div>
              )}
              {companyId && (
                <Tag 
                  value={`ID: ${companyId}`} 
                  className="bg-blue-100 text-blue-800 text-xs" 
                />
              )}
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">{name || 'Company Name'}</h1>
            
            <div className="inline-block bg-green-100 rounded-full p-2 mb-4 md:mb-6">
              <i className="pi pi-link text-green-600"></i>
            </div>
            
            <div className="mt-2 md:mt-3 text-gray-600 text-sm md:text-base">
              {city && (
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <i className="pi pi-map-marker"></i>
                  <span>{city}</span>
                </div>
              )}
              
              {website && (
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <i className="pi pi-globe"></i>
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {email && (
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <i className="pi pi-envelope"></i>
                  <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                    {email}
                  </a>
                </div>
              )}
              
              {phone && (
                <div className="flex items-center gap-2">
                  <i className="pi pi-phone"></i>
                  <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                    {phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Company Description */}
      <div className="p-4 md:p-6 pt-6 md:pt-8 border-t mt-4 md:mt-6">
        <h2 className="text-xl md:text-2xl font-medium mb-2">About</h2>
        <p className="text-gray-600 text-sm md:text-base">
          {headline || 'No description available'}
        </p>
      </div>
    </div>
  );
};

export default CompanyHeader; 