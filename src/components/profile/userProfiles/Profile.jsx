import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import UserDetailsGridLoader from "../../../components/profile/UserDetailsGridLoader";
import { useUserDetails } from "../../../context/profile/UserDetailsContext";
import UserProfileTopNavigation from "../profileNavigation/UserProfileTopNavigation";
import { AuthContext } from "../../../context/auth/AuthContext";
import { tokenHandler } from "../../../utils/tokenHandler";
import { User, Mail, Save, X, Edit2 } from "lucide-react";
import CurrencyDropdown from "../../CurrencyDropdown/CurrencyDropdown";
import PhoneNumber from "../PhoneNumber";
import { AddressCard } from "../AddressComponents";
import CompanyDetails from "../CompanyDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, CircleX } from "lucide-react";
import api from "../../../api/axios.config";

// Personal Edit Form Component
const PersonalEditForm = ({
  userDetails,
  editedCurrency,
  onCurrencyChange,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState(
    userDetails?.normalizedName || ""
  );

  const handleSavePersonal = async () => {
    try {
      setIsLoading(true);
      const updatedData = {
        currency: editedCurrency,
        name: editedName,
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
            <label className="text-sm text-gray-600">Name *</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
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

const Profile = () => {
  const {
    userDetails,
    company,
    fetchUserDetails,
    updateUserDetails,
    fetchCompanyDetails,
    companyList,
    searchCompanies,
  } = useUserDetails();
  const { refreshAccessToken, logout } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const popupRef = useRef(null);
  const [isCompanySelected, setIsCompanySelected] = useState(false);
  const [minSearchLength] = useState(4);
  const [popup, setPopup] = useState({
    show: false,
    type: null, // 'claim', 'terms', 'unauthorized', 'accountExist'
  });

  // Derived company names from companyList
  const companyListNames = useMemo(
    () => companyList.map((com) => com.name),
    [companyList]
  );

  // Optimized search effect
  useEffect(() => {
    if (isCompanySelected || searchTerm.trim().length < minSearchLength) {
      return;
    }

    const handler = setTimeout(() => {
      searchCompanies({ comName: searchTerm }).catch(console.error);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchCompanies, isCompanySelected, minSearchLength]);

  //HandleCOmpanyClick
  const handleCompanyClick = useCallback(
    async (company, userDetails) => {
      if (isCompanySelected) return;

      setIsCompanySelected(true);
      setSearchTerm(company.name);

      try {
        const data = await fetchCompanyDetails(company.id);
        console.log(userDetails.email);
        
        // processCountUser(data.userInfo.length, company, userDetails);

        processCountUser(0, company, userDetails);
      } catch (err) {
        console.error("Error fetching company:", err);
        setIsCompanySelected(false); // Reset on error
      }
    },
    [isCompanySelected, fetchCompanyDetails]
  );

  const processCountUser = useCallback(
    (userCount, company, userDetails) => {
      console.log(userDetails);
      
      const userDomain = userDetails?.email?.split("@")[1]?.toLowerCase() || "";
      console.log(userDomain);

      // const companyDomain = company?.email?.split("@")[1]?.toLowerCase() || "";

      setPopup({
        show: true,
        type:
          userCount === 0
            ? // ? userDomain === companyDomain
              userDomain === "instacharter.app"
              ? "claim"
              : "unauthorized"
            : "accountExist",
      });
    },
    [userDetails?.email]
  );

  // Popup control functions
  const openCompanySearch = useCallback(
    () => setPopup({ show: true, type: "companySearch" }),
    []
  );
  const openTermsPopup = useCallback(
    () => setPopup({ show: true, type: "terms" }),
    []
  );
  const closePopup = useCallback(
    () => setPopup({ show: false, type: null }),
    []
  );

  const handlerdSearch = useCallback(() => {
    if (!searchTerm.trim()) return;
    const params = { comName: searchTerm };
    searchCompanies(params).catch(console.error);
  }, [searchTerm, searchCompanies]);

  useEffect(() => {
    const handler = setTimeout(handlerdSearch, 300);
    return () => clearTimeout(handler);
  }, [handlerdSearch]);

  // Search companies on company change
  useEffect(() => {
    if (!company) return;
    searchCompanies({ comName: company.name }).catch(console.error);
  }, [company, searchCompanies]);

  const [editSection, setEditSection] = useState(null);
  const [editedCurrency, setEditedCurrency] = useState(
    userDetails?.currency || ""
  );

  useEffect(() => {
    fetchUserDetails();
    fetchCompanyDetails();
  }, [fetchUserDetails, fetchCompanyDetails]);

  useEffect(() => {
    if (userDetails) {
      setEditedCurrency(userDetails.currency || "");
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
        throw new Error("No access token available after refresh");
      }
      await fetchUserDetails();

      toast.success(
        `${
          section.charAt(0).toUpperCase() + section.slice(1)
        } details updated successfully!`,
        {
          toastId: `${section}-success`,
        }
      );

      setEditSection(null);
    } catch (err) {
      if (
        err.message.includes("No refresh token available") ||
        err.message.includes("Failed to refresh token") ||
        err.message.includes("No access token available")
      ) {
        toast.error("Your session has expired. Please log in again.", {
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

  if (!userDetails) {
    return <UserDetailsGridLoader />;
  }

  return (
    <div className="w-full p-4">
      <ToastContainer />

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row w-full gap-4 mt-4">
        {/* Left column - Personal Information */}
        <div className="w-full md:w-1/2 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
            <div className="p-5 border-b border-gray-200 items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <User className="mr-2 w-5 h-5" /> Personal
              </h2>
              <Edit2
                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
                onClick={() => handleEditClick("personal")}
              />

              {editSection === "personal" ? (
                <PersonalEditForm
                  userDetails={userDetails}
                  editedCurrency={editedCurrency}
                  onCurrencyChange={handleCurrencyChange}
                  onSave={handleSave}
                  onCancel={() => setEditSection(null)}
                />
              ) : (
                <div className="flex flex-col md:flex-row p-5">
                  <div className="mb-4 md:mb-0 md:mr-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <div className="flex items-start">
                      <User className="mr-2 text-gray-500 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="text-gray-800 font-medium truncate">
                          {userDetails?.normalizedName || "Not set"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-2 text-gray-500 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="text-gray-800 truncate">
                          {userDetails?.email || "Not set"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-600">Currency</div>
                        <div className="text-gray-800">
                          {userDetails?.currency || "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Section */}
            <PhoneNumber
              userDetails={userDetails.phoneNumber}
              editSection={editSection}
              setEditSection={setEditSection}
              handleSave={handleSave}
            />

            {/* Address Section */}
            <AddressCard
              userDetails={userDetails}
              editSection={editSection}
              setEditSection={setEditSection}
              handleSave={handleSave}
            />

            {/* /Pop up code */}
            <div className="p-6">
              {/* Clickable Heading */}
              <h2
                onClick={openCompanySearch}
                className="text-xl font-semibold text-blue-600 cursor-pointer hover:underline"
              >
                Switch to Seller Account
              </h2>
              <h2 className="text-xl font-semibold text-blue-600 cursor-pointer hover:underline">
                Learn About Selling on EasyCharter
              </h2>

              {/* Popup Modal */}
              {popup.show && popup.type === "companySearch" && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  onClick={closePopup}
                >
                  <div
                    ref={popupRef}
                    className="bg-white rounded-lg shadow-lg w-96 p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-lg font-bold mb-4 cursor-pointer text-black-600 hover:underline">
                      Search Your Company Name
                    </h2>

                    {/* Search Bar with Icon */}
                    <div className="relative mb-4">
                      {/* <-- Added relative here */}
                      <div className="flex items-center border rounded-md px-3 py-2">
                        <Search className="w-5 h-5 text-gray-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Search companies"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full focus:outline-none"
                        />
                      </div>
                      {/* Helper text for minimum characters */}
                      {searchTerm && searchTerm.length < minSearchLength && (
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          Type at least {minSearchLength} characters to search
                        </div>
                      )}
                      {searchTerm && searchTerm.length >= minSearchLength && companyList.length > 0 &&(
                        <ul className="absolute left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                          {companyList.map((company, index) => (
                            <li
                              key={company.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleCompanyClick(company, userDetails)}
                            >
                              {company.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={closePopup}
                        className="mt-6 bg-white border border-b-2 text-black px-4 py-2 rounded hover:bg-gray-100"
                      >
                        Add a new Company
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* acc up code */}
          {/* Account Pop up */}
          {popup.show && popup.type === "accountExist" && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold text-black cursor-pointer hover:underline">
                      This Account Exists
                    </h2>
                    <CircleX
                      className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500"
                      onClick={() => setPopup({ show: false, type: null })}
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-4 text-gray-800">
                    Please ask the administrator <strong>[email]</strong> to add
                    you to the team.
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => setPopup({ show: false, type: null })}
                    >
                      Ok
                    </button>
                    <button
                      className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => setPopup({ show: false, type: null })}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* UnAuthorised */}
          {popup.show && popup.type === "unauthorized" && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative z-50">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h2 className="text-lg font-bold text-black cursor-pointer hover:underline">
                    Unauthorized
                  </h2>
                  <CircleX
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500"
                    onClick={() => setPopup({ show: false, type: null })}
                  />
                </div>

                {/* Message */}
                <div className="mb-4 text-gray-800">
                  Please create an account with the email of this business & try
                  again.
                </div>

                {/* Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                    onClick={() => setPopup({ show: false, type: null })}
                  >
                    Ok
                  </button>
                  <button
                    className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                    onClick={() => setPopup({ show: false, type: null })}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Claim Popup */}
          {popup.show && popup.type === "claim" && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative z-50">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold text-black cursor-pointer hover:underline">
                      Claim
                    </h2>
                    <CircleX
                      className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500"
                      onClick={() => setPopup({ show: false, type: null })}
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-4 text-gray-800">
                    Please create an account with the email of this business &
                    try again.
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => setPopup({ show: false, type: null })}
                    >
                      No
                    </button>

                    <button onClick={openTermsPopup}>Yes</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Terms and Conditions */}

          {popup.show && popup.type === "terms" && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold text-black cursor-pointer hover:underline">
                      Terms and Conditions
                    </h2>
                    <CircleX
                      className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500"
                      onClick={() => setPopup({ show: false, type: null })}
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-4 text-gray-800">
                    Please read Seller Terms and Conditions and press "I Agree"
                    to continue.
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button onClick={closePopup}>No</button>
                    <button
                      className="bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // Handle agreement logic here
                        setPopup({ show: false, type: null });
                      }}
                    >
                      I Agree
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column - Company Details */}
        {/* <div className="w-full md:w-1/2 space-y-3">
          <CompanyDetails
            editSection={editSection}
            setEditSection={setEditSection}
            handleSave={handleSave}
          />
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
