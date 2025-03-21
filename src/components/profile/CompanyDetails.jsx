import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { useUserDetails } from '../../context/profile/UserDetailsContext';

const CompanyDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { company, fetchCompanyDetails } = useUserDetails();
  
  // Local state for editable fields
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [city, setCity] = useState(company?.city || '');
  const [country, setCountry] = useState(company?.country || '');
  const [email, setEmail] = useState(company?.email || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [roles, setRoles] = useState(company?.roles || '');

  const handleEditClick = () => {
    setIsEditing(true);
    // Initialize with current values
    setCompanyName(company?.name || '');
    setCity(company?.city || '');
    setCountry(company?.country || '');
    setEmail(company?.email || '');
    setPhone(company?.phone || '');
    setRoles(company?.roles || '');
  };

  const handleSave = async () => {
    try {
      // Here you would typically call an API to save the changes
      // For this example, we'll just update the context
      const updatedCompany = {
        name: companyName,
        city,
        country,
        email,
        phone,
        roles
      };
      // Assuming there's an updateCompanyDetails function in your context
      // await userService.updateCompanyDetails(updatedCompany);
      await fetchCompanyDetails(); // Refresh data after save
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save company details:', err);
    }
  };

  // Format address by combining city, country
  const formatAddress = () => {
    if (!company && !isEditing) return '';
    
    const addressParts = [];
    if (isEditing ? city : company?.city) addressParts.push(isEditing ? city : company?.city);
    if (isEditing ? country : company?.country) addressParts.push(isEditing ? country : company?.country);
    
    return addressParts.join(', ');
  };

  if (!company && !isEditing) {
    return (
      <>
        <h1 className="text-2xl text-gray-900 font-semibold mb-1">
          Your Company
        </h1>
        <div className="w-full bg-white rounded-lg p-4 relative border border-gray-200">
          <p className="text-gray-500">No company information available.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl text-gray-900 font-semibold mb-1">
        Your Company
      </h1>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Company Details
          </h2>
          <Edit2
            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={handleEditClick}
          />
        </div>
        
        {isEditing ? (
          <div className="p-5">
            <div className="space-y-4">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Company Name"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City"
              />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Country"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone"
              />
              <input
                type="text"
                value={roles}
                onChange={(e) => setRoles(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Roles"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <X className="mr-2 w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
              >
                <Save className="mr-2 w-4 h-4" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {company?.name || 'Company Name'}
            </h1>
            <p className="text-lg text-gray-500">
              {formatAddress()} {company?.email ? ` · ${company?.email}` : ''}
            </p>
            {company?.phone && (
              <p className="text-lg text-gray-500 mt-1">
                {company?.phone}
              </p>
            )}
            {company?.roles && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-md font-medium text-blue-600 bg-blue-100 rounded-full">
                  {company?.roles}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyDetails;