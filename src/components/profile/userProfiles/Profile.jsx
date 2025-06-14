import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import UserDetailsGridLoader from "../UserDetailsGridLoader";
import { useUserDetails } from "../../../context/profile/UserDetailsContext";
import { AuthContext } from "../../../context/auth/AuthContext";
import { tokenHandler } from "../../../utils/tokenHandler";
import { User, Mail, Phone, MapPin, DollarSign, Edit2, Save, X, Camera, Info } from "lucide-react";
import CurrencyDropdown from "../../CurrencyDropdown/CurrencyDropdown";
import PhoneNumber from "../PhoneNumber";
import { AddressCard } from "../AddressComponents";
import CompanyDetails from "../CompanyDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, CircleX } from "lucide-react";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { AutoComplete } from 'primereact/autocomplete';
import { countryService } from "../../../api/profile/countryService";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { userService } from "../../../api/profile/user.service";
import AddCompanyForm from "../AddCompanyForm";

const libraries = ["places"];

// Personal Edit Form Component
const PersonalEditForm = ({
  userDetails,
  editedCurrency,
  onCurrencyChange,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(
    userDetails?.normalizedName?.split(' ')[0] || ""
  );
  const [surname, setSurname] = useState(
    userDetails?.normalizedName?.split(' ').slice(1).join(' ') || ""
  );
  const [email, setEmail] = useState(userDetails?.email || "");
  const [mobile, setMobile] = useState(
    userDetails?.phoneNumber?.replace(/^\+\d+\s+/, '') || ""
  );
  const [address, setAddress] = useState(userDetails?.fullAddress?.address || "");
  const [country, setCountry] = useState(userDetails?.fullAddress?.country || userDetails?.country || "");
  const [timeZoneOffset, setTimeZoneOffset] = useState(userDetails?.timeZone || 0);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Load Google Maps API
  const { isLoaded: isGoogleMapsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
    libraries,
  });

  const onPlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const addressComponents = place.address_components;
      let countryName = "";

      addressComponents.forEach(component => {
        if (component.types.includes("country")) {
          countryName = component.long_name;
        }
      });

      const timeZone = place.utc_offset_minutes || 0;

      setAddress(place.formatted_address);
      setCountry(countryName);
      setTimeZoneOffset(timeZone);
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await countryService.getAllCountries();
        if (response && response.success && Array.isArray(response.data)) {
          const formattedCountries = response.data.map(country => ({
            name: country.country,
            code: country.callingCode,
            flag: country.flag,
            id: country.id
          }));
          setCountries(formattedCountries);
          
          // Try to determine the current country from the phone number
          if (userDetails?.phoneNumber && userDetails.phoneNumber.includes('+')) {
            const countryCode = userDetails.phoneNumber.split(' ')[0];
            const country = formattedCountries.find(c => countryCode === c.code);
            if (country) {
              setSelectedCountry(country);
            } else {
              setSelectedCountry(formattedCountries[0]);
            }
          } else {
            setSelectedCountry(formattedCountries[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleSavePersonal = async () => {
    try {
      setIsLoading(true);
      const formattedPhone = selectedCountry ? `${selectedCountry.code} ${mobile}` : mobile;
      
      // Create a properly formatted payload for the API
      const updatePayload = {
        id: userDetails.id, // Required field
        companyId: userDetails.companyId || null,
        userCode: userDetails.userCode || null,
        planId: userDetails.planId || null,
        name: `${firstName} ${surname}`.trim(),
        email: email || userDetails.email,
        phoneNo: formattedPhone,
        // Use address directly in the root instead of nesting it
        address: address,
        Share: userDetails.share || 0,
        country: country,
        currency: editedCurrency,
        timeZone: timeZoneOffset || 0,
        profileImage: userDetails.profileImage || "",
        // Include these required fields with default values
        shareContact: userDetails.shareContact !== undefined ? userDetails.shareContact : true,
        isPublicContact: userDetails.isPublicContact !== undefined ? userDetails.isPublicContact : true
      };
      
      console.log('Updating user profile with data:', updatePayload);
      
      await onSave("personal", updatePayload);
    } finally {
      setIsLoading(false);
    }
  };

  const countryTemplate = (option) => {
  return (
        <div className="flex items-center">
        <span>{option.name} ({option.code})</span>
      </div>
    );
  };

  const selectedCountryTemplate = (option) => {
    if (option) {
      return (
        <div className="flex items-center">
          <span>{option.code}</span>
        </div>
      );
    }
    return <span>Select</span>;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Edit Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <InputText 
            id="firstName"
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            className="w-full"
            />
          </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
          <InputText 
            id="surname"
            value={surname} 
            onChange={(e) => setSurname(e.target.value)} 
            className="w-full"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <InputText 
          id="email"
          value={email} 
              disabled
          className="w-full bg-gray-50"
            />
          </div>
      
      <div className="mb-4">
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
        <div className="flex items-center gap-2">
          <Dropdown
            value={selectedCountry}
            options={countries}
            onChange={(e) => setSelectedCountry(e.value)}
            optionLabel="name"
            placeholder="Select"
            valueTemplate={selectedCountryTemplate}
            itemTemplate={countryTemplate}
            className="w-40"
          />
          <InputText 
            id="mobile"
            value={mobile} 
            onChange={(e) => setMobile(e.target.value)} 
            className="flex-1"
            placeholder="Enter phone number"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        {isGoogleMapsLoaded ? (
          <Autocomplete
            onLoad={(autocomplete) => {
              console.log("Autocomplete loaded for Personal Edit form");
              autocomplete.addListener("place_changed", () => {
                console.log("Place changed event triggered in Personal Edit");
                const place = autocomplete.getPlace();
                if (place && place.geometry) {
                  onPlaceChanged(autocomplete);
                }
              });
            }}
            options={{
              types: ["address"],
              fields: ["address_components", "formatted_address", "geometry", "name"]
            }}
          >
            <InputText 
              id="address"
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full"
              placeholder="Enter your address (start typing to see suggestions)"
            />
          </Autocomplete>
        ) : (
          <InputText 
            id="address"
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            className="w-full"
            placeholder="Loading Google Maps..."
          />
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <InputText 
          id="country"
          value={country} 
          disabled
          className="w-full bg-gray-50"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <CurrencyDropdown
              value={editedCurrency}
              onChange={onCurrencyChange}
              name="currency"
          className="w-full"
            />
          </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button 
          label="Cancel" 
          onClick={onCancel} 
          className="p-button-outlined p-button-secondary" 
        />
        <Button 
          label={isLoading ? "Saving..." : "Save"} 
          onClick={handleSavePersonal} 
          loading={isLoading}
        />
        </div>
      
      
      </div>
  );
};

// Seller Registration Component
const SellerRegistration = ({ 
  visible, 
  onHide, 
  currentStep, 
  setCurrentStep, 
  searchTerm, 
  setSearchTerm, 
  minSearchLength,
  companyList,
  handleCompanyClick,
  userDetails,
  handlerdSearch,
  selectedCompany,
  setSelectedCompany
}) => {
  // State for policy links
  const [policyLinks, setPolicyLinks] = useState({
    privacyPolicy: "",
    termsOfService: ""
  });
  const [showPolicyOverlay, setShowPolicyOverlay] = useState(false);
  const [policyUrl, setPolicyUrl] = useState("");
  const [policyTitle, setPolicyTitle] = useState("");
  const [policiesLoaded, setPoliciesLoaded] = useState(false);
  const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false);
  const [termsOfServiceChecked, setTermsOfServiceChecked] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Fetch policy links when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && !policiesLoaded) {
      fetchPolicyLinks();
    }
  }, [currentStep, policiesLoaded]);
  
  // Function to fetch policy links from API
  const fetchPolicyLinks = async () => {
    try {
      const response = await fetch(
        "https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/GetInfo?topic=policies&category=link",
        {
          headers: {
            "accept": "text/plain",
            "X-Api-Key": "instacharter@2025",
            "Authorization": `Bearer ${tokenHandler.getToken()}`
          }
        }
      );
      
      const data = await response.json();
      console.log("Policy links data:", data);
      
      if (data.success && Array.isArray(data.data)) {
        const privacyPolicy = data.data.find(policy => policy.title === "Privacy");
        const termsOfService = data.data.find(policy => policy.title === "Terms of Service");
        
        setPolicyLinks({
          privacyPolicy: privacyPolicy?.url || "",
          termsOfService: termsOfService?.url || ""
        });
        
        setPoliciesLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching policy links:", error);
    }
  };
  
  // Function to open policy in overlay
  const openPolicyOverlay = (url, title) => {
    setPolicyUrl(url);
    setPolicyTitle(title);
    setShowPolicyOverlay(true);
  };
  
  // Function to close policy overlay
  const closePolicyOverlay = () => {
    setShowPolicyOverlay(false);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      onHide(); // Close the dialog if on first step
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!searchTerm || searchTerm.trim().length < minSearchLength) {
        setSearchError(`Please enter at least ${minSearchLength} characters or select a company`);
        return false;
      }
      setSearchError("");
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
    setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Company search input handler
  const handleSearchChange = (e) => {
    const value = e.value || '';
    setSearchTerm(value);
    
    // Clear error when user types
    if (value) {
      setSearchError("");
    }
    
    if (value.length >= minSearchLength) {
      handlerdSearch();
    }
    
    searchCompanies(value);
  };
  
  // Search suggestions
  const searchCompanies = (query) => {
    if (query.length < minSearchLength) {
      setFilteredCompanies([]);
      return;
    }
    
    // Filter companies based on search query
    setTimeout(() => {
      let filteredItems;
      
      if (!query.trim().length) {
        filteredItems = [...companyList];
      } else {
        filteredItems = companyList.filter((company) => {
          return company.name.toLowerCase().includes(query.toLowerCase());
        });
      }
      
      setFilteredCompanies(filteredItems);
    }, 250);
  };
  
  // Company item template
  const companyItemTemplate = (company) => {
    return (
      <div className="flex flex-col">
        <div className="font-medium">{company.name}</div>
        {company.city && company.country && (
          <div className="text-sm text-gray-600">{company.city}, {company.country}</div>
        )}
      </div>
    );
  };
  
  // Search click handler
  const handleSearchClick = () => {
    if (searchTerm && searchTerm.length >= minSearchLength) {
      handlerdSearch();
    }
  };
  
  // Role selection handler
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (type) => {
    if (type === 'privacy') {
      setPrivacyPolicyChecked(!privacyPolicyChecked);
    } else if (type === 'terms') {
      setTermsOfServiceChecked(!termsOfServiceChecked);
    }
  };

  const handleAddCompanyClick = () => {
    setShowAddCompanyForm(true);
  };
  
  const handleCompanyAdded = (newCompany) => {
    // Refresh the company list after a new company is added
    handlerdSearch();
    setSelectedCompany(newCompany);
    setSearchTerm(newCompany.name);
    toast.success("New company added successfully!");
  };

  return (
    <>
    <Dialog
      visible={visible}
      onHide={onHide}
      style={{ width: '800px' }}
      breakpoints={{ '960px': '90vw', '641px': '95vw' }}
      footer={null}
        className="seller-registration-dialog"
        closable={true}
        showHeader={false}
    >
        <div className="p-0">
          {/* Header with back button and search button */}
          <div className="flex justify-between items-center p-3 border-b">
            <div className="flex items-center">
              <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-rounded mr-2" 
                onClick={handleBackClick}
                aria-label="Back"
              />
              <span className="text-xl font-medium">Register as Seller</span>
            </div>
            <Button 
              label="Search" 
              className="p-button-text p-button-sm text-blue-500" 
            />
          </div>
          
        {/* Progress Steps */}
          <div className="flex justify-between items-center p-3 border-b">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm mt-1">Claim or Create</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm mt-1">Confirm Role</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm mt-1">Terms of Service</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="text-sm mt-1">Register</span>
          </div>
        </div>

        {/* Step 1: Claim or Create */}
        {currentStep === 1 && (
          <div className="p-4">
            <p className="mb-6 text-center">
              Search and select your company from the box below and click on 
              next to claim an existing company. You may create a new company
              also.
            </p>

            <div className="mb-4">
                <label htmlFor="company-name" className="block text-sm font-medium mb-1">
                  Company Name<span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  id="company-name"
                  value={searchTerm}
                  suggestions={filteredCompanies}
                  completeMethod={searchCompanies}
                  field="name"
                  dropdown
                  dropdownAutoFocus
                  onChange={(e) => handleSearchChange(e)}
                  onSelect={(e) => {
                    handleCompanyClick(e.value, userDetails);
                    setSelectedCompany(e.value);
                    setSearchError("");
                  }}
                  itemTemplate={companyItemTemplate}
                  placeholder="Enter company name (min 4 characters)"
                  className={`w-full ${searchError ? 'p-invalid' : ''}`}
                  appendTo="self"
                  panelClassName="company-dropdown-panel"
                />
                {searchError && (
                  <small className="p-error block mt-1">{searchError}</small>
              )}
            </div>
            
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  label="Add a Company" 
                  className="p-button-outlined" 
                  onClick={handleAddCompanyClick}
                />
                <Button 
                  label="Next" 
                  className="p-button-primary" 
                  onClick={nextStep}
                  disabled={!searchTerm || searchTerm.length < minSearchLength}
                />
            </div>
          </div>
        )}

        {/* Step 2: Confirm Role */}
        {currentStep === 2 && (
          <div className="p-4">
              <p className="text-center mb-6">Please Select your Primary Role</p>
            
            <div className="mb-4">
                <label htmlFor="role-dropdown" className="block text-sm font-medium mb-1">Role</label>
                <Dropdown
                  id="role-dropdown"
                  value={selectedRole}
                  options={[
                    { label: 'Broker', value: 'Broker' },
                    { label: 'Operator', value: 'Operator' }
                  ]}
                  onChange={(e) => handleRoleSelect(e.value)}
                  placeholder="Dropdown"
                  className="w-full"
                />
            </div>

              <div className="flex justify-end gap-3 mt-6">
              <Button 
                  label="Go Back" 
                className="p-button-outlined p-button-secondary" 
                onClick={prevStep} 
              />
              <Button 
                label="Next" 
                className="p-button-primary" 
                onClick={nextStep}
                  disabled={!selectedRole}
              />
            </div>
          </div>
        )}

        {/* Step 3: Terms of Service */}
        {currentStep === 3 && (
          <div className="p-4">
              <p className="text-center mb-6">Please provide consent to Marketplace policies</p>
            
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <Checkbox 
                    inputId="privacy-policy" 
                    checked={privacyPolicyChecked}
                    onChange={() => handleCheckboxChange('privacy')}
                    className="mr-2"
                  />
                  <label htmlFor="privacy-policy">
                    I agree to the <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        openPolicyOverlay(policyLinks.privacyPolicy, "Privacy Policy");
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
            </div>
                <div className="flex items-center">
                  <Checkbox 
                    inputId="terms-of-service" 
                    checked={termsOfServiceChecked}
                    onChange={() => handleCheckboxChange('terms')}
                    className="mr-2"
                  />
                  <label htmlFor="terms-of-service">
                    I agree to the <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        openPolicyOverlay(policyLinks.termsOfService, "Terms of Service");
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </a>
                  </label>
                </div>
            </div>

              <div className="flex justify-end gap-3 mt-6">
              <Button 
                  label="Cancel" 
                className="p-button-outlined p-button-secondary" 
                  onClick={onHide} 
              />
              <Button 
                label="Next" 
                className="p-button-primary" 
                onClick={nextStep}
                  disabled={!privacyPolicyChecked || !termsOfServiceChecked}
              />
            </div>
          </div>
        )}

        {/* Step 4: Register */}
        {currentStep === 4 && (
          <div className="p-4 text-center">
            <h3 className="text-xl mb-4">Complete Registration</h3>
            
              <p className="mb-6">You're all set! Click the Register button to complete your seller registration.</p>

              <div className="flex justify-end gap-3 mt-6">
              <Button 
                label="Back" 
                className="p-button-outlined p-button-secondary" 
                onClick={prevStep} 
              />
              <Button 
                label="Register" 
                className="p-button-primary" 
                onClick={onHide}
              />
            </div>
          </div>
        )}
          
          {/* Policy Document Overlay */}
          <Dialog
            header={policyTitle}
            visible={showPolicyOverlay}
            onHide={closePolicyOverlay}
            style={{ width: '80vw' }}
            maximizable
          >
            {policyUrl ? (
              <iframe
                src={policyUrl}
                style={{ width: '100%', height: '70vh', border: 'none' }}
                title={policyTitle}
              />
            ) : (
              <p>Loading policy document...</p>
            )}
          </Dialog>
      </div>
    </Dialog>
      
      {/* Add Company Form */}
      <AddCompanyForm 
        visible={showAddCompanyForm} 
        onHide={() => setShowAddCompanyForm(false)}
        userDetails={userDetails}
        onSuccess={handleCompanyAdded}
      />
    </>
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
    addCompany,
    checkAdminAccess
  } = useUserDetails();
  const { refreshAccessToken, logout } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const popupRef = useRef(null);
  const [isCompanySelected, setIsCompanySelected] = useState(false);
  const [minSearchLength] = useState(4);
  const [popup, setPopup] = useState({
    show: false,
    type: null, // 'claim', 'terms', 'unauthorized', 'accountExist', 'companySearch', 'corporateAccount', 'addCompany'
    showErrors: false
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Add Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    roles: "seller", // Default role
    email: "",
    phone: "",
    countryCode: "", // Added for phone number formatting
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    currency: userDetails?.currency || "USD",
    primaryRole: ""
  });
  
  // Loading state for add company form
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  
  // State for company countries dropdown
  const [companyCountries, setCompanyCountries] = useState([]);
  const [selectedCompanyCountry, setSelectedCompanyCountry] = useState(null);
  
  // Load Google Maps API
  const { isLoaded: isGoogleMapsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
    libraries,
  });
  
  // Log API load status for debugging without exposing sensitive information
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API failed to load:", loadError);
    } else {
      console.log("Google Maps API Status:", isGoogleMapsLoaded ? "Loaded" : "Loading...");
    
    // Check if the API key is valid
    if (isGoogleMapsLoaded) {
      console.log("Google Maps API successfully loaded");
      
      // Check if the Autocomplete service is available
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Places API is available");
      } else {
        console.error("Google Places API is not available. Check if 'places' is included in the libraries array.");
      }
    }
    }
  }, [isGoogleMapsLoaded, loadError]);
  
  // Handle place selection from Google Places Autocomplete
  const handleCompanyPlaceChanged = useCallback((place) => {
    console.log("Processing place in handleCompanyPlaceChanged:", place);
    
    if (!place) {
      console.warn("No place object received");
      return;
    }
    
    if (!place.address_components) {
      console.warn("No address components in place object");
      // Still try to use formatted_address if available
      if (place.formatted_address) {
        setCompanyForm(prev => ({
          ...prev,
          street: place.formatted_address
        }));
      }
      return;
    }
    
    const addressComponents = place.address_components;
    let street = "";
    let streetNumber = "";
    let route = "";
    let city = "";
    let state = "";
    let country = "";
    let zipcode = "";
    
    // Extract address components
    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      
      if (types.includes("route")) {
        route = component.long_name;
      }
      
      if (types.includes("locality") || types.includes("sublocality") || types.includes("administrative_area_level_3")) {
        city = component.long_name;
      }
      
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
      
      if (types.includes("country")) {
        country = component.long_name;
      }
      
      if (types.includes("postal_code")) {
        zipcode = component.long_name;
      }
    });
    
    // Combine street number and route for full street address
    street = streetNumber ? `${streetNumber} ${route}`.trim() : route;
    
    // If street is still empty, use the formatted address
    if (!street && place.formatted_address) {
      const formattedParts = place.formatted_address.split(',');
      if (formattedParts.length > 0) {
        street = formattedParts[0].trim();
      }
    }
    
    console.log("Google Places selection:", {
      street,
      city,
      state,
      country,
      zipcode,
      formatted_address: place.formatted_address
    });
    
    // Update form state with extracted address components
    setCompanyForm(prev => ({
      ...prev,
      street: street || prev.street,
      city: city || prev.city,
      state: state || prev.state,
      country: country || prev.country,
      zipcode: zipcode || prev.zipcode
    }));
  }, []);
  
  // Seller registration state
  const [sellerRegistrationStep, setSellerRegistrationStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showSellerRegistration, setShowSellerRegistration] = useState(false);

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
      // Use the SearchCompanies endpoint with all available parameters
      const params = { 
        comName: searchTerm,
        // Add optional parameters if available
        country: companyForm.country || undefined,
        city: companyForm.city || undefined,
        // Add role if available in your UI
        role: companyForm.primaryRole || undefined
      };
      
      searchCompanies(params).catch(console.error);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchCompanies, isCompanySelected, minSearchLength, companyForm.country, companyForm.city, companyForm.primaryRole]);

  //HandleCompanyClick
  const handleCompanyClick = useCallback(
    async (company, userDetails) => {
      if (isCompanySelected) return;

      setIsCompanySelected(true);
      setSearchTerm(company.name);
      setSelectedCompany(company);

      try {
        const data = await fetchCompanyDetails(company.id);
        processCountUser(data.userInfo.length, company, userDetails);
      } catch (err) {
        console.error("Error fetching company:", err);
        setIsCompanySelected(false); // Reset on error
        setSelectedCompany(null);
      }
    },
    [isCompanySelected, fetchCompanyDetails]
  );

  const processCountUser = useCallback(
    (userCount, company, userDetails) => {
      const userDomain = userDetails?.email?.split("@")[1]?.toLowerCase() || "";
      const companyDomain = company?.email?.split("@")[1]?.toLowerCase() || "";

      setPopup({
        show: true,
        type:
          userCount === 0
             ? userDomain === companyDomain  
              ? "claim"
              : "unauthorized"
            : "accountExist",
        showErrors: false
      });
    },
    [userDetails?.email]
  );

  // Popup control functions
  const openCompanySearch = useCallback(() => {
    // Check if user has admin role using the context function
    if (checkAdminAccess()) {
      setShowSellerRegistration(true);
    } else {
      // Show contact admin dialog
      setPopup({ show: true, type: "contactAdmin", showErrors: false });
    }
  }, [checkAdminAccess]);

  const openTermsPopup = useCallback(
    () => setPopup({ show: true, type: "terms", showErrors: false }),
    []
  );

  const closePopup = useCallback(
    () => {
      setPopup({ show: false, type: null, showErrors: false });
      setShowSellerRegistration(false);
      setSellerRegistrationStep(1);
    },
    []
  );

  // Corporate account popup functions
  const openCorporateAccountDialog = useCallback(() => {
    // Check if user has admin role using the context function
    if (checkAdminAccess()) {
      setPopup({ show: true, type: "corporateAccount", showErrors: false });
    } else {
      // Show contact admin dialog
      setPopup({ show: true, type: "contactAdmin", showErrors: false });
    }
  }, [checkAdminAccess]);
  
  const openAddCompanyForm = useCallback(
    () => setPopup({ show: true, type: "addCompany", showErrors: false }),
    []
  );
  
  // Handle company form input changes
  const handleCompanyFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Handle company form submission
  const handleAddCompany = useCallback(async () => {
    try {
      setIsAddingCompany(true);
      
      // Format phone number with country code
      const formattedPhone = selectedCompanyCountry 
        ? `${selectedCompanyCountry.code} ${companyForm.phone}` 
        : companyForm.phone;
      
      // Prepare the payload for the API with ALL required fields
      const companyPayload = {
        name: companyForm.name,
        roles: companyForm.roles || "seller",
        email: companyForm.email,
        phone: formattedPhone,
        street: companyForm.street,
        city: companyForm.city,
        state: companyForm.state,
        country: companyForm.country,
        zipcode: companyForm.zipcode,
        currency: companyForm.currency || userDetails?.currency || "USD",
        // Required fields with default values
        fax: "",
        whatsapp: "",
        description: "",
        headline: "",
        logo: "",
        web: "",
        doc_no: 0,
        invoice_no: 0,
        standard_deduction_gross_margin: 0,
        footer_text: "",
        payment_info: "",
        doc_prefix: "",
        certificatsId: "",
        isRestricted: false
      };
      
      console.log('Submitting company data:', companyPayload);
      
      const response = await addCompany(companyPayload);
      
      if (response && response.success) {
        toast.success("Company added successfully!");
        closePopup();
        
        // Reset the form
        setCompanyForm({
          name: "",
          roles: "seller",
          email: "",
          phone: "",
          countryCode: selectedCompanyCountry?.code || "",
          street: "",
          city: "",
          state: "",
          country: "",
          zipcode: "",
          currency: userDetails?.currency || "USD",
          primaryRole: ""
        });
      }
    } catch (error) {
      console.error("Failed to add company:", error);
      toast.error(`Failed to add company: ${error.message}`);
    } finally {
      setIsAddingCompany(false);
    }
  }, [addCompany, closePopup, companyForm, userDetails?.currency, selectedCompanyCountry]);

  const handlerdSearch = useCallback((customParams = null) => {
    if (!searchTerm.trim()) return;
    
    // Use the SearchCompanies endpoint with all available parameters
    const params = customParams || { 
      comName: searchTerm,
      // Add optional parameters if available
      country: companyForm.country || undefined,
      city: companyForm.city || undefined,
      // Add role if available in your UI
      role: companyForm.primaryRole || undefined
    };
    
    searchCompanies(params).catch(console.error);
  }, [searchTerm, searchCompanies, companyForm.country, companyForm.city, companyForm.primaryRole]);

  useEffect(() => {
    const handler = setTimeout(handlerdSearch, 300);
    return () => clearTimeout(handler);
  }, [handlerdSearch]);

  // Search companies on company change
  useEffect(() => {
    if (!company) return;
    searchCompanies({ comName: company.name }).catch(console.error);
  }, [company, searchCompanies]);

  // Fetch countries for phone number dropdown
  useEffect(() => {
    const fetchCompanyCountries = async () => {
      try {
        const response = await countryService.getAllCountries();
        if (response && response.success && Array.isArray(response.data)) {
          const formattedCountries = response.data.map(country => ({
            name: country.country,
            code: country.callingCode,
            flag: country.flag,
            id: country.id
          }));
          setCompanyCountries(formattedCountries);
          
          // Set default country
          if (formattedCountries.length > 0) {
            setSelectedCompanyCountry(formattedCountries[0]);
            setCompanyForm(prev => ({
              ...prev,
              countryCode: formattedCountries[0].code
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchCompanyCountries();
  }, []);

  const [editSection, setEditSection] = useState(null);
  const [editedCurrency, setEditedCurrency] = useState(
    userDetails?.currency || ""
  );

  useEffect(() => {
    fetchUserDetails();
    fetchCompanyDetails();

    // Debug: Log user role
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      console.log('User role from token:', userData?.role);
      console.log('Has admin access:', checkAdminAccess());
    }
  }, [fetchUserDetails, fetchCompanyDetails, checkAdminAccess]);

  useEffect(() => {
    if (userDetails) {
      setEditedCurrency(userDetails.currency || "");
    }
  }, [userDetails]);

  const handleEditClick = (section) => {
    setEditSection(section);
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      console.log('Starting file upload for:', file.name);
      
      // Upload the file to get the URL
      const uploadResult = await userService.uploadProfileImage(file);
      console.log('Upload successful, result:', uploadResult);
      
      // Extract the image URL from the response
      // The response might contain an array of URLs or a single URL string
      let imageUrl;
      if (Array.isArray(uploadResult)) {
        imageUrl = uploadResult[0];
        console.log('Using first URL from array:', imageUrl);
      } else if (typeof uploadResult === 'string') {
        imageUrl = uploadResult;
        console.log('Using URL string:', imageUrl);
      } else if (uploadResult && typeof uploadResult === 'object') {
        // If it's an object, try to find a URL property
        imageUrl = uploadResult.url || uploadResult.path || uploadResult.fileUrl || uploadResult;
        console.log('Extracted URL from object:', imageUrl);
      } else {
        console.error('Unexpected upload result format:', uploadResult);
        throw new Error('Invalid response format from upload');
      }
      
      if (!imageUrl) {
        throw new Error('No image URL found in response');
      }
      
      console.log('Updating user profile with image URL:', imageUrl);
      
      // Ensure we have all required fields from the current userDetails
      const updatePayload = {
        id: userDetails.id, // Required field as per API documentation
        companyId: userDetails.companyId || null,
        userCode: userDetails.userCode || null,
        planId: userDetails.planId || null,
        name: userDetails.normalizedName || "",
        email: userDetails.email || "",
        phoneNo: userDetails.phoneNumber || "", // Use phoneNo instead of phoneNumber
        address: userDetails.fullAddress?.address || "", // Use address directly in the root
        Share: userDetails.share || 0,
        country: userDetails.country || "",
        currency: userDetails.currency || "",
        timeZone: userDetails.timeZone || 0,
        profileImage: imageUrl,
        // Include these required fields with default values
        shareContact: userDetails.shareContact !== undefined ? userDetails.shareContact : true,
        isPublicContact: userDetails.isPublicContact !== undefined ? userDetails.isPublicContact : true
      };
      
      console.log('Profile update payload:', updatePayload);
      
      // Update the user profile with the new image URL
      const response = await updateUserDetails(updatePayload);
      
      if (response && response.success) {
        toast.success("Profile image updated successfully!");
        
        // Immediately fetch user details to update the UI without refreshing
      await fetchUserDetails();

        // Still refresh the token in the background
        try {
          await refreshAccessToken();
        } catch (refreshError) {
          console.error('Error refreshing token after image update:', refreshError);
          // Don't show an error to the user since the update was successful
        }
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      
      // More descriptive error message
      let errorMessage = "Failed to update profile image.";
      if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (section, updatedData) => {
    try {
      console.log('Received update payload:', updatedData);
      
      let formattedPayload = updatedData;
      
      // Special handling for address section
      if (section === "address") {
        formattedPayload = {
          id: userDetails.id, // Required field
          companyId: userDetails.companyId || null,
          userCode: userDetails.userCode || null,
          planId: userDetails.planId || null,
          name: userDetails.normalizedName || "",
          email: userDetails.email || "",
          phoneNo: userDetails.phoneNumber || "",
          // Use address directly in the root instead of nesting it
          address: updatedData.address || "",
          Share: userDetails.share || 0,
          country: updatedData.country || userDetails.country || "",
          currency: userDetails.currency || "",
          timeZone: updatedData.timeZoneOffset || userDetails.timeZone || 0,
          profileImage: userDetails.profileImage || "",
          // Include these required fields with default values
          shareContact: userDetails.shareContact !== undefined ? userDetails.shareContact : true,
          isPublicContact: userDetails.isPublicContact !== undefined ? userDetails.isPublicContact : true
        };
        
        console.log('Formatted address payload:', formattedPayload);
      }
      
      // Send the update request with the properly formatted payload
      const response = await updateUserDetails(formattedPayload);
      
      // Immediately update the local UI state with the updated data
      if (response && response.success) {
        toast.success(
          `${
            section.charAt(0).toUpperCase() + section.slice(1)
          } details updated successfully!`,
          {
            toastId: `${section}-success`,
          }
        );

        setEditSection(null);
        
        // Immediately fetch user details to update the UI without refreshing
        await fetchUserDetails();
        
        // Still refresh the token in the background
        try {
          await refreshAccessToken();
        } catch (refreshError) {
          console.error('Error refreshing token after update:', refreshError);
          // Don't show an error to the user since the update was successful
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
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

  // Add CSS for company dropdown
  useEffect(() => {
    // Add custom styling for the company dropdown
    const style = document.createElement('style');
    style.textContent = `
      .company-dropdown-panel .p-autocomplete-item {
        padding: 0.75rem;
        border-bottom: 1px solid #f0f0f0;
      }
      .company-dropdown-panel .p-autocomplete-item:hover {
        background-color: #f8f9fa;
      }
      .company-dropdown-panel {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!userDetails) {
    return <UserDetailsGridLoader />;
  }

  return (
    <div className="container mx-auto">
      <ToastContainer />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Profile Info */}
        <div>
          <Card className="shadow-sm">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 relative group">
                    {userDetails?.profileImage ? (
                      <img
                        src={userDetails.profileImage.split(",")[0]}
                        alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                        <User className="w-12 h-12 text-gray-400" />
                  )}
                  
                  {/* Edit overlay */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleProfileImageClick}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {/* Loading overlay */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                </div>
                  </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium">Name</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-700">{userDetails?.normalizedName || "Not set"}</span>
                  <Button 
                    icon="pi pi-pencil" 
                    className="p-button-text p-button-rounded ml-2" 
                    onClick={() => handleEditClick("personal")}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium">Email</span>
                </div>
                <span className="text-gray-700">{userDetails?.email || "Not set"}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium">Phone</span>
                </div>
                <span className="text-gray-700">{userDetails?.phoneNumber || "Not set"}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium">Currency</span>
                </div>
                <span className="text-gray-700">{userDetails?.currency || "Not set"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-4">
                <div className="flex items-center mb-1 sm:mb-0">
                  <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium">Address</span>
                </div>
                <div className="pl-7 sm:pl-0 sm:text-right sm:max-w-[65%]">
                  <p className="text-gray-700 break-words leading-snug">
                    {userDetails?.fullAddress?.address || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <Divider />
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">Traveller</h3>
              
              <div className="text-blue-500">
                <a href="#" className="flex items-center mb-3 hover:underline" onClick={(e) => {
                  e.preventDefault();
                  openCorporateAccountDialog();
                }}>
                  Create a Corporate Account
                  <i className="pi pi-arrow-right ml-2"></i>
                </a>
                
                <a href="#" className="flex items-center hover:underline" onClick={(e) => {
                  e.preventDefault();
                  openCompanySearch();
                }}>
                  Switch to Seller Account
                  <i className="pi pi-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Edit Form or History */}
        <div>
          <Card className="shadow-sm">
            {editSection === "personal" ? (
              <PersonalEditForm
              userDetails={userDetails}
                editedCurrency={editedCurrency}
                onCurrencyChange={handleCurrencyChange}
                onSave={handleSave}
                onCancel={() => setEditSection(null)}
              />
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">History</h2>
                </div>
                
                <div className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Air Charter Services</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">Booked</span>
                  </div>
                  <p className="text-gray-600">Delhi to Mumbai</p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Company Search Dialog */}
      <Dialog 
        header="Search Your Company Name" 
        visible={popup.show && popup.type === "companySearch"} 
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText 
                          placeholder="Search companies"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                        />
            </span>
                      {searchTerm && searchTerm.length < minSearchLength && (
              <small className="text-gray-500">Type at least {minSearchLength} characters to search</small>
            )}
          </div>
          
          {searchTerm && searchTerm.length >= minSearchLength && companyList.length > 0 && (
            <ul className="list-none p-0 m-0 max-h-60 overflow-y-auto">
              {companyList.map((company) => (
                            <li
                              key={company.id}
                  className="p-3 border-bottom-1 surface-border cursor-pointer hover:surface-200"
                              onClick={() => handleCompanyClick(company, userDetails)}
                            >
                              {company.name}
                            </li>
                          ))}
                        </ul>
                      )}
          
          <div className="flex justify-center mt-4">
            <Button 
              label="Add a new Company" 
              className="p-button-outlined"
                        onClick={closePopup}
            />
                    </div>
                  </div>
      </Dialog>

      {/* Account Exists Dialog */}
      <Dialog
        header="This Account Exists"
        visible={popup.show && popup.type === "accountExist"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <p className="mb-4">Please ask the administrator <strong>[email]</strong> to add you to the team.</p>
        <div className="flex justify-center gap-2">
          <Button label="Ok" className="p-button-outlined" onClick={closePopup} />
          <Button label="Cancel" className="p-button-outlined p-button-secondary" onClick={closePopup} />
                </div>
      </Dialog>

      {/* Unauthorized Dialog */}
      <Dialog
        header="Unauthorized"
        visible={popup.show && popup.type === "unauthorized"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <p className="mb-4">Please create an account with the email of this business & try again.</p>
        <div className="flex justify-center gap-2">
          <Button label="Ok" className="p-button-outlined" onClick={closePopup} />
          <Button label="Cancel" className="p-button-outlined p-button-secondary" onClick={closePopup} />
            </div>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog
        header="Claim"
        visible={popup.show && popup.type === "claim"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <p className="mb-4">Please create an account with the email of this business & try again.</p>
        <div className="flex justify-center gap-2">
          <Button label="No" className="p-button-outlined p-button-secondary" onClick={closePopup} />
          <Button label="Yes" className="p-button-outlined" onClick={openTermsPopup} />
                  </div>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog
        header="Terms and Conditions"
        visible={popup.show && popup.type === "terms"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <p className="mb-4">Please read Seller Terms and Conditions and press "I Agree" to continue.</p>
        <div className="flex justify-center gap-2">
          <Button label="No" className="p-button-outlined p-button-secondary" onClick={closePopup} />
          <Button label="I Agree" className="p-button-outlined" onClick={closePopup} />
                  </div>
      </Dialog>
      
      {/* Corporate Account Dialog */}
      <Dialog
        header="Corporate Account"
        visible={popup.show && popup.type === "corporateAccount"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <div className="flex items-center mb-4">
          <div className="bg-blue-50 p-2 rounded-full mr-3">
            <Info className="text-blue-500" size={20} />
          </div>
          <p>
            With a Corporate Account you can add team members and negotiate better deals for your company. 
            Verification is required.
          </p>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button label="Cancel" className="p-button-outlined p-button-secondary" onClick={closePopup} />
          <Button label="Continue" className="p-button-primary" onClick={openAddCompanyForm} />
        </div>
      </Dialog>
      
      {/* Contact Admin Dialog */}
      <Dialog
        header="Admin Access Required"
        visible={popup.show && popup.type === "contactAdmin"}
        onHide={closePopup}
        style={{ width: '450px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <div className="flex items-center mb-4">
          <div className="bg-yellow-50 p-2 rounded-full mr-3">
            <Info className="text-yellow-500" size={20} />
          </div>
          <p className="text-gray-700">
            This feature requires administrator privileges. Please contact your system administrator for assistance.
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Contact Support</h3>
          <p className="text-sm text-gray-600 mb-2">
            For access to this feature, please contact our support team:
          </p>
          <div className="flex items-center mb-2">
            <Mail className="w-4 h-4 text-blue-500 mr-2" />
            <a href="mailto:support@instacharter.app" className="text-blue-500 hover:underline">
              support@instacharter.app
            </a>
          </div>
          <div className="flex items-center mb-3">
            <Phone className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-gray-700">+1 (555) 123-4567</span>
          </div>
          
          {userDetails?.role && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              Your current role: <span className="font-medium">{userDetails.role}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button label="OK" className="p-button-primary" onClick={closePopup} />
        </div>
      </Dialog>
      
      {/* Seller Registration Dialog */}
      <SellerRegistration
        visible={showSellerRegistration}
        onHide={closePopup}
        currentStep={sellerRegistrationStep}
        setCurrentStep={setSellerRegistrationStep}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        minSearchLength={minSearchLength}
        companyList={companyList}
        handleCompanyClick={handleCompanyClick}
        userDetails={userDetails}
        handlerdSearch={handlerdSearch}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
      />

      {/* Add Company Dialog for Corporate Account */}
      <Dialog
        header="Add a Company"
        visible={popup.show && popup.type === "addCompany"}
        onHide={closePopup}
        style={{ width: '500px' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="company-name" className="block text-sm font-medium mb-1">
              Company Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="company-name"
              name="name"
              value={companyForm.name}
              onChange={handleCompanyFormChange}
              className={`w-full ${!companyForm.name && popup.showErrors ? 'p-invalid' : ''}`}
                  />
            {!companyForm.name && popup.showErrors && (
              <small className="p-error block mt-1">Company name is required</small>
            )}
          </div>

          <div className="field mb-4">
            <label htmlFor="company-email" className="block text-sm font-medium mb-1">
              Support Email Address<span className="text-red-500">*</span>
            </label>
            <InputText
              id="company-email"
              name="email"
              value={companyForm.email}
              onChange={handleCompanyFormChange}
              className={`w-full ${!companyForm.email && popup.showErrors ? 'p-invalid' : ''}`}
            />
            {!companyForm.email && popup.showErrors && (
              <small className="p-error block mt-1">Email is required</small>
            )}
          </div>

          <div className="field mb-4">
            <label htmlFor="company-phone" className="block text-sm font-medium mb-1">
              Phone<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Dropdown
                value={selectedCompanyCountry}
                options={companyCountries}
                onChange={(e) => {
                  setSelectedCompanyCountry(e.value);
                  setCompanyForm(prev => ({
                    ...prev,
                    countryCode: e.value.code
                  }));
                }}
                optionLabel="name"
                placeholder="Select"
                valueTemplate={(option) => {
                  if (option) {
                    return (
                      <div className="flex items-center">
                        <span>{option.code}</span>
                </div>
                    );
                  }
                  return <span>Select</span>;
                }}
                itemTemplate={(option) => (
                  <div className="flex items-center">
                    <span>{option.name} ({option.code})</span>
            </div>
          )}
                className="w-40"
              />
              <InputText
                id="company-phone"
                name="phone"
                value={companyForm.phone}
                onChange={handleCompanyFormChange}
                className={`flex-1 ${!companyForm.phone && popup.showErrors ? 'p-invalid' : ''}`}
                placeholder="Enter phone number"
                    />
                  </div>
            {!companyForm.phone && popup.showErrors && (
              <small className="p-error block mt-1">Phone number is required</small>
            )}
          </div>

          <div className="field mb-4">
            <label htmlFor="company-location" className="block text-sm font-medium mb-1">
              Location<span className="text-red-500">*</span>
            </label>
            
            {/* Street Address with Google Places Autocomplete */}
            {isGoogleMapsLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => {
                  console.log("Autocomplete loaded for Add Company form");
                  autocomplete.addListener("place_changed", () => {
                    console.log("Place changed event triggered in Add Company");
                    const place = autocomplete.getPlace();
                    if (place && place.geometry) {
                      handleCompanyPlaceChanged(place);
                    } else {
                      console.warn("Place selected but no geometry found");
                    }
                  });
                }}
                options={{
                  types: ["address"],
                  fields: ["address_components", "formatted_address", "geometry", "name"]
                }}
              >
                <InputText 
                  id="company-location"
                  name="street"
                  value={companyForm.street} 
                  onChange={handleCompanyFormChange} 
                  className={`w-full mb-2 ${!companyForm.street && popup.showErrors ? 'p-invalid' : ''}`}
                  placeholder="Enter street address (start typing to see suggestions)"
                />
              </Autocomplete>
            ) : (
              <div>
                <InputText
                  id="company-location"
                  name="street"
                  value={companyForm.street}
                  onChange={handleCompanyFormChange}
                  placeholder="Loading Google Maps..."
                  className={`w-full mb-2 ${!companyForm.street && popup.showErrors ? 'p-invalid' : ''}`}
                  disabled
                />
                <small className="text-red-500">Google Maps API is not loaded. Please check your API key.</small>
              </div>
            )}
            {!companyForm.street && popup.showErrors && (
              <small className="p-error block mt-1">Address is required</small>
            )}
            
            {/* City and State fields */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <InputText
                name="city"
                value={companyForm.city}
                onChange={handleCompanyFormChange}
                placeholder="City"
              />
              <InputText
                name="state"
                value={companyForm.state}
                onChange={handleCompanyFormChange}
                placeholder="State"
                    />
                  </div>

            {/* Country and ZIP Code fields */}
            <div className="grid grid-cols-2 gap-2">
              <Dropdown
                name="country"
                value={companyForm.country}
                options={companyCountries.map(c => ({ label: c.name, value: c.name }))}
                onChange={(e) => {
                  setCompanyForm(prev => ({
                    ...prev,
                    country: e.value
                  }));
                }}
                optionLabel="label"
                placeholder="Country"
                className="w-full"
              />
              <InputText
                name="zipcode"
                value={companyForm.zipcode}
                onChange={handleCompanyFormChange}
                placeholder="ZIP Code"
              />
            </div>
          </div>
          
          <div className="field mb-4">
            <label htmlFor="company-role" className="block text-sm font-medium mb-1">
              Primary Role<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="company-role"
              name="primaryRole"
              value={companyForm.primaryRole}
              options={[
                { label: 'Aircraft Operator', value: 'operator' },
                { label: 'Broker', value: 'broker' },
                { label: 'Travel Agent', value: 'agent' },
                { label: 'Other', value: 'other' }
              ]}
              onChange={handleCompanyFormChange}
              placeholder="Select a role"
              className={`w-full ${!companyForm.primaryRole && popup.showErrors ? 'p-invalid' : ''}`}
            />
            {!companyForm.primaryRole && popup.showErrors && (
              <small className="p-error block mt-1">Primary role is required</small>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-red-500">*</span> Required fields
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              label="Cancel" 
              className="p-button-outlined p-button-secondary" 
              onClick={closePopup} 
            />
            <Button 
              label={isAddingCompany ? "Adding..." : "Add"} 
              className="p-button-primary" 
              onClick={() => {
                // Check if required fields are filled
                if (!companyForm.name || !companyForm.email || !companyForm.phone || 
                    !companyForm.street || !companyForm.primaryRole) {
                  // Show validation errors
                  setPopup(prev => ({ ...prev, showErrors: true }));
                } else {
                  // Clear validation errors and submit
                  setPopup(prev => ({ ...prev, showErrors: false }));
                  handleAddCompany();
                }
              }}
              disabled={isAddingCompany}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Profile;
