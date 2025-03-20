import React, { useEffect, useState, useContext } from "react";
import { useUserDetails } from "../../context/profile/UserDetailsContext";
import { AuthContext } from "../../context/auth/AuthContext";
import { tokenHandler } from "../../utils/tokenHandler"; 
import { 
  User, 
  Mail, 
  Save, 
  X,
  Trash2,
  Edit2 
} from "lucide-react";
import CurrencyDropdown from '../CurrencyDropdown/CurrencyDropdown'; 
import PhoneNumber from './PhoneNumber';
import { AddressCard } from './AddressComponents';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Personal Edit Form Component
const PersonalEditForm = ({ userDetails, editedCurrency, onCurrencyChange, onSave, onCancel }) => {
  const [firstName, setFirstName] = useState(userDetails?.normalizedName?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(userDetails?.normalizedName?.split(" ")[1] || "");
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleSavePersonal = async () => {
    try {
      setIsLoading(true);
      const updatedData = {
        name: `${firstName} ${lastName}`.trim(),
        currency: editedCurrency
      };
      await onSave("personal", updatedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <User className="mr-2 w-5 h-5" /> Edit Personal Information
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Legal First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Legal Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Email *</label>
            <input
              type="email"
              value={userDetails?.email || ""}
              disabled
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Currency *</label>
            <CurrencyDropdown
              value={editedCurrency}
              onChange={onCurrencyChange}
              name="currency"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
        >
          <X className="mr-2 w-4 h-4" /> Cancel
        </button>
        <button
          onClick={handleSavePersonal}
          disabled={isLoading}
          className={`px-4 py-2 flex items-center rounded-lg transition-all duration-200 ${
            isLoading
              ? "bg-blue-700 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          <Save className="mr-2 w-4 h-4" /> 
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const AboutMe = () => {
  const { userDetails, fetchUserDetails, updateUserDetails } = useUserDetails();
  const { refreshAccessToken, logout } = useContext(AuthContext);

  const [editSection, setEditSection] = useState(null);
  const [editedCurrency, setEditedCurrency] = useState(userDetails?.currency || "");
  const [editedName, setEditedName] = useState(userDetails?.normalizedName || "");

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    if (userDetails) {
      setEditedCurrency(userDetails.currency || "");
      setEditedName(userDetails.normalizedName || "");
    }
  }, [userDetails]);

  const handleEditClick = (section) => {
    setEditSection(section);
  };

  const handleSave = async (section, updatedData) => {
    try {
      await updateUserDetails(updatedData);
      await refreshAccessToken();
      const accessToken = tokenHandler.getToken();
      if (!accessToken) {
        throw new Error('No access token available after refresh');
      }
      await fetchUserDetails();
      
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} details updated successfully!`, {
        toastId: `${section}-success`,
      });
      
      setEditSection(null);
    } catch (err) {
      if (
        err.message.includes('No refresh token available') ||
        err.message.includes('Failed to refresh token') ||
        err.message.includes('No access token available')
      ) {
        toast.error('Your session has expired. Please log in again.', {
          toastId: `${section}-session-error`,
        });
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        toast.error(`Failed to update ${section} details. Please try again.`, {
          toastId: `${section}-error`,
        });
      }
    }
  };

  const handleCurrencyChange = (e) => {
    setEditedCurrency(e.target.value);
  };

  return (
    <div className="w-full max-w-3xl space-y-3 p-4">
      <ToastContainer />
      {/* Personal Information Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <User className="mr-2 w-5 h-5" /> Personal
          </h2>
          <Edit2
            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => handleEditClick("personal")}
          />
        </div>

        {editSection === "personal" ? (
          <PersonalEditForm 
            userDetails={userDetails || {}}
            editedCurrency={editedCurrency}
            onCurrencyChange={handleCurrencyChange}
            onSave={handleSave}
            onCancel={() => setEditSection(null)}
          />
        ) : (
          <div className="flex p-5">
            <div className="mr-6">
              {userDetails?.profileImage ? (
                <img
                  src={userDetails.profileImage.split(",")[0]}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div className="flex items-start">
                <User className="mr-2 text-gray-500 w-5 h-5 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="text-gray-800 font-medium">{userDetails?.normalizedName || "Not set"}</div>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="mr-2 text-gray-500 w-5 h-5 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="text-gray-800">{userDetails?.email || "Not set"}</div>
                </div>
              </div>
              <div className="flex items-start ml-6">
                <div>
                  <div className="text-sm text-gray-600">Currency</div>
                  <div className="text-gray-800">{userDetails?.currency || "Not set"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PhoneNumber 
        userDetails={userDetails || {}}
        editSection={editSection}
        setEditSection={setEditSection}
        handleSave={handleSave}
      />

      <AddressCard 
        userDetails={userDetails || {}}
        editSection={editSection}
        onEditClick={() => handleEditClick("address")}
        onSave={handleSave}
        onCancel={() => setEditSection(null)}
      />
    </div>
  );
};

export default AboutMe;