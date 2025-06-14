import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { tokenHandler } from '../../../../utils/tokenHandler';

// API base URL and auth headers
const API_BASE_URL = 'https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net';
const API_KEY = 'instacharter@2025';

const getAuthHeaders = () => {
  // Use dynamic token from tokenHandler instead of hardcoded token
  const token = tokenHandler.getToken();
  
  return {
    'accept': 'text/plain',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json'
  };
};

// Add image compression helper function
const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Only compress if image is larger than maxWidth
        if (img.width <= maxWidth) {
          resolve(file); // No need to compress, return original file
          return;
        }
        
        const canvas = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to Blob/File
        canvas.toBlob((blob) => {
          // Create a new File object with the compressed blob
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.onerror = (error) => {
        console.error("Error loading image for compression:", error);
        resolve(file); // Return original on error
      };
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      resolve(file); // Return original on error
    };
  });
};

const FleetForm = ({ fleetItem, onSave, onCancel, mode = 'add', companyId }) => {
  // Get company ID from token or use provided ID or default
  const actualCompanyId = companyId || tokenHandler.parseUserFromToken(tokenHandler.getToken())?.comId || 2757;
  
  const [formData, setFormData] = useState({
    id: null,
    registration: '',
    type: '',
    location: '',
    currency: '',
    perHour: '',
    taxyTime: '',
    na: false,
    aircraftType: null,
    roles: [],
    yom: '',
    yor: '',
    seats: '',
    base: '',
    baseLat: 0,
    baseLong: 0,
    mtow: '',
    modeS: '',
    exteriorImage: '',
    otherImages: [],
    insuranceDate: null,
    airworthinessDate: null,
    documents: [],
    amenities: []
  });
  
  const [currencies, setCurrencies] = useState([]);
  const [step, setStep] = useState(1);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Aircraft Type dropdown state
  const [isAircraftTypeOpen, setIsAircraftTypeOpen] = useState(false);
  const [aircraftTypeSearch, setAircraftTypeSearch] = useState('');
  const aircraftTypeRef = useRef(null);
  
  // Roles state
  const [rolesSearch, setRolesSearch] = useState('');
  
  // Add currencyRef and state for currency dropdown
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const currencyRef = useRef(null);
  
  // Add state for image uploads
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  const exteriorFileUploadRef = useRef(null);
  const otherImagesFileUploadRef = useRef(null);
  
  // Add state for document upload
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadProgress, setDocUploadProgress] = useState(0);
  const documentFileUploadRef = useRef(null);
  
  // Add state for base dropdown
  const [isBaseOpen, setIsBaseOpen] = useState(false);
  const [baseSearch, setBaseSearch] = useState('');
  const [airports, setAirports] = useState([]);
  const [searchingAirports, setSearchingAirports] = useState(false);
  const baseRef = useRef(null);
  
  // Add state for role conflict dialog
  const [showRoleConflictDialog, setShowRoleConflictDialog] = useState(false);
  const [conflictRole, setConflictRole] = useState(null);
  const [roleToReplace, setRoleToReplace] = useState('');
  
  // Add state for amenities
  const [amenities, setAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  
  // Add state for tracking API submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  // Add state for tracking current file being uploaded
  const [currentFileUpload, setCurrentFileUpload] = useState({ current: 0, total: 0 });
  
  // Add state to force re-renders when images are uploaded
  const [imagesUpdateCounter, setImagesUpdateCounter] = useState(0);
  
  // Initialize form with fleet item data if editing
  useEffect(() => {
    if (fleetItem) {
      // Convert string roles to objects if needed
      let roleObjects = [];
      if (Array.isArray(fleetItem.roles) && fleetItem.roles.length > 0) {
        // Handle both string roles and object roles
        roleObjects = fleetItem.roles.map(role => {
          if (typeof role === 'string') {
            return { 
              id: role, // Use string as ID
              text: role 
            };
          } else if (role.text) {
            return {
              id: role.id || role.text,
              text: role.text
            };
          }
          return null;
        }).filter(Boolean);
      } else if (fleetItem.othertags) {
        // If roles are stored in othertags as comma-separated string
        const roleStrings = fleetItem.othertags.split(',').map(r => r.trim()).filter(Boolean);
        roleObjects = roleStrings.map(roleStr => ({
          id: roleStr,
          text: roleStr
        }));
      }
      
      // Handle images array from API response
      let exteriorImg = '';
      let otherImgs = [];
      
      // If images array exists in the API response
      if (fleetItem.images && Array.isArray(fleetItem.images) && fleetItem.images.length > 0) {
        // First image is the exterior image
        exteriorImg = fleetItem.images[0].trim();
        
        // Rest are other images
        if (fleetItem.images.length > 1) {
          otherImgs = fleetItem.images.slice(1).map(img => img.trim());
        }
      }
      
      // Safe check for taxyTime - ensure it's a string before using includes()
      const taxyTimeStr = fleetItem.taxyTime ? String(fleetItem.taxyTime) : '';
      const formattedTaxyTime = taxyTimeStr.includes(':') ? taxyTimeStr : formatToTime(parseFloat(taxyTimeStr) || 0);
      
      // Ensure yom and yor are numbers for API calls but strings for form display
      const yomValue = fleetItem.yom ? fleetItem.yom : '';
      const yorValue = fleetItem.yor ? fleetItem.yor : '';
      
      console.log('Initializing form with fleet item:', fleetItem);
      
      // Initialize amenities - handle both array of objects and string format
      let initialAmenities = [];
      if (fleetItem.amenities) {
        // If amenities is an array of objects (from API response)
        if (Array.isArray(fleetItem.amenities) && fleetItem.amenities.length > 0 && 
            typeof fleetItem.amenities[0] === 'object' && fleetItem.amenities[0].amenities_Id) {
          initialAmenities = fleetItem.amenities;
          console.log('Using amenities objects from API response:', initialAmenities);
        } 
        // If it's a string of comma-separated IDs, it will be handled in the amenities fetch useEffect
      }
      
      // Set the base search value if base exists
      if (fleetItem.base) {
        setBaseSearch(fleetItem.base); // Set at least the ICAO code
      }
      
      setFormData({
        ...formData, // Keep default values
        ...fleetItem,
        id: fleetItem.id, // Ensure ID is set for edit operations
        aircraftType: fleetItem.type ? { name: fleetItem.type } : null,
        roles: roleObjects,
        // Map API fields to form fields
        registration: fleetItem.slNo || fleetItem.tail || fleetItem.registration || '',
        type: fleetItem.aircraft_Type_Name || fleetItem.type || '',
        perHour: fleetItem.rate || fleetItem.perHour || '',
        na: fleetItem.blocked || fleetItem.na || false,
        seats: fleetItem.tail_Max_Pax || fleetItem.seats || '',
        yom: yomValue,
        yor: yorValue,
        // Handle images
        exteriorImage: fleetItem.exteriorImage || exteriorImg,
        otherImages: fleetItem.otherImages || otherImgs,
        documents: fleetItem.documents || [],
        // Use the safely formatted taxy time
        taxyTime: formattedTaxyTime,
        // Use initial amenities if available
        amenities: initialAmenities,
        // Set base explicitly
        base: fleetItem.base || '',
      });
      
      // Log the registration field
      console.log('Registration field initialized as:', {
        slNo: fleetItem.slNo,
        tail: fleetItem.tail,
        registration: fleetItem.registration,
        finalValue: fleetItem.slNo || fleetItem.tail || fleetItem.registration || ''
      });
      
      // Set search fields for dropdowns
      if (fleetItem.type || fleetItem.aircraft_Type_Name) {
        setAircraftTypeSearch(fleetItem.aircraft_Type_Name || fleetItem.type);
      }
      
      // Set currency search if currency exists
      if (fleetItem.currency) {
        // Find the currency object to get the proper name
        const currencyObj = currencies.find(c => c.currency_symbole === fleetItem.currency);
        if (currencyObj) {
          setCurrencySearch(currencyObj.currency_name);
        } else {
          setCurrencySearch(fleetItem.currency);
        }
      }
      
      // If base exists, fetch airport details to get coordinates
      if (fleetItem.base) {
        fetchAirportDetails(fleetItem.base).then(airportDetails => {
          if (airportDetails) {
            // Update base search with more details if available
            setBaseSearch(`${airportDetails.airportName || ''} [${fleetItem.base}]`);
            
            setFormData(prev => ({
              ...prev,
              baseObject: airportDetails,
              baseLat: airportDetails.latitude || fleetItem.latitude || fleetItem.baseLat || 0,
              baseLong: airportDetails.longitude || fleetItem.longitude || fleetItem.baseLong || 0
            }));
          }
        });
      }
    }
  }, [fleetItem, currencies]);
  
  // Handle click outside to close aircraft type dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aircraftTypeRef.current && !aircraftTypeRef.current.contains(event.target)) {
        setIsAircraftTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch aircraft types from API
  useEffect(() => {
    const fetchAircraftTypes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/SinglePoint/GetAllAircraftTypesDetails`,
          {
            headers: getAuthHeaders()
          }
        );
        
        if (response.data && response.data.success) {
          setAircraftTypes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching aircraft types:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAircraftTypes();
  }, []);
  
  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/SinglePoint/GetInfo`,
          {
            params: {
              topic: 'tailtags',
              category: 'dropdown'
            },
            headers: getAuthHeaders()
          }
        );
        
        if (response.data && response.data.success) {
          setRoles(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, []);
  
  // Fetch currencies from API
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Markets/GetAllCurrencyInfo`,
          {
            headers: getAuthHeaders()
          }
        );
        
        if (response.data && response.data.success) {
          setCurrencies(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  // Fetch amenities from API
  useEffect(() => {
    const fetchAmenities = async () => {
      setAmenitiesLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/SinglePoint/GetAllAminites`,
          {
            headers: getAuthHeaders()
          }
        );
        
        if (response.data && response.data.success) {
          // Filter out any invalid amenities (those without required properties)
          const validAmenities = response.data.data.filter(
            amenity => amenity && typeof amenity === 'object' && amenity.amenities_Id && amenity.amenities_Name
          );
          
          setAmenities(validAmenities);

          // If editing and amenities are already in formData as objects, don't override them
          if (formData.amenities && Array.isArray(formData.amenities) && 
              formData.amenities.length > 0 && 
              typeof formData.amenities[0] === 'object' && 
              formData.amenities[0].amenities_Id) {
            console.log('Amenities already set as objects, not overriding');
            return;
          }

          // If editing and amenities are provided as a string of IDs
          if (fleetItem && fleetItem.amenities) {
            let selectedAmenities = [];
            
            // If it's a string, parse it as comma-separated IDs
            if (typeof fleetItem.amenities === 'string') {
              const amenitiesArray = fleetItem.amenities.split(',').map(Number).filter(Boolean);
              
              // Find the matching amenity objects from the API response
              selectedAmenities = validAmenities.filter(amenity => 
                amenitiesArray.includes(amenity.amenities_Id)
              );
            }
            // If it's already an array but not set in formData yet
            else if (Array.isArray(fleetItem.amenities) && fleetItem.amenities.length > 0) {
              // If array contains objects with amenities_Id
              if (typeof fleetItem.amenities[0] === 'object' && fleetItem.amenities[0].amenities_Id) {
                selectedAmenities = fleetItem.amenities;
              }
              // If array contains just IDs
              else {
                selectedAmenities = validAmenities.filter(amenity => 
                  fleetItem.amenities.includes(amenity.amenities_Id)
                );
              }
            }
            
            setFormData(prev => ({
              ...prev,
              amenities: selectedAmenities
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
      } finally {
        setAmenitiesLoading(false);
      }
    };
    
    fetchAmenities();
  }, [fleetItem, formData.amenities]);
  
  // Add function to clear validation error for a specific field
  const clearValidationError = (fieldName) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };
  
  // Update handleInputChange to clear validation errors immediately when fixed
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error immediately if field is now valid
    if (value && validationErrors[name]) {
      clearValidationError(name);
    }
  };
  
  const handleCheckboxChange = (e, role) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Update handleDropdownChange to clear validation errors
  const handleDropdownChange = (e, field) => {
    if (field === 'aircraftType') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: e.value,
        type: e.value ? e.value.name : ''
      }));
      
      // Clear type validation error if field is now valid
      if (e.value && e.value.name && validationErrors.type) {
        clearValidationError('type');
      }
    } else if (field === 'currency') {
      // For currency dropdown, we need to store both the symbol and name
      const selectedCurrency = currencies.find(c => c.currency_symbole === e.value);
      setFormData(prev => ({ 
        ...prev, 
        [field]: e.value,
        currencyName: selectedCurrency ? selectedCurrency.currency_name : '',
        currencyObject: selectedCurrency
      }));
      
      // Clear currency validation error if field is now valid
      if (e.value && validationErrors.currency) {
        clearValidationError('currency');
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: e.value }));
      
      // Clear validation error if field is now valid
      if (e.value && validationErrors[field]) {
        clearValidationError(field);
      }
    }
  };
  
  // Update handleAircraftTypeSelect to clear validation error
  const handleAircraftTypeSelect = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      aircraftType: type,
      type: type ? type.name : ''
    }));
    setAircraftTypeSearch(type ? type.name : '');
    setIsAircraftTypeOpen(false);
    
    // Clear type validation error if valid aircraft type is selected
    if (type && type.name && validationErrors.type) {
      clearValidationError('type');
    }
  };
  
  const handleSubmit = () => {
    // Convert form data to the format expected by the API
    const apiEndpoint = mode === 'add' 
      ? `${API_BASE_URL}/api/SinglePoint/AddTail`
      : `${API_BASE_URL}/api/SinglePoint/UpdateTail`;
    
    // Convert taxyTime from HH:MM format to decimal hours if needed
    let taxyTimeDecimal = formData.taxyTime;
    if (formData.taxyTime && formData.taxyTime.includes(':')) {
      const [hours, minutes] = formData.taxyTime.split(':').map(Number);
      taxyTimeDecimal = hours + (minutes / 60);
    }
    
    // Ensure images are properly formatted as a string
    let imagesString = '';
    if (formData.exteriorImage || (Array.isArray(formData.otherImages) && formData.otherImages.length > 0)) {
      const imageArray = [
      formData.exteriorImage, 
      ...(Array.isArray(formData.otherImages) ? formData.otherImages : [])
      ].filter(Boolean);
      imagesString = imageArray.join(',');
    }
    
    // Format document URLs into a comma-separated string
    const documentUrls = Array.isArray(formData.documents) 
      ? formData.documents.map(doc => doc.url).join(',') 
      : '';
    
    // Format roles into a comma-separated string
    const rolesString = formData.roles.length > 0 
      ? formData.roles.map(r => r.text).join(',') 
      : "";
    
    // Format amenities into a comma-separated string of IDs
    const amenitiesString = formData.amenities && Array.isArray(formData.amenities) && formData.amenities.length > 0
      ? formData.amenities
          .filter(a => a && typeof a === 'object' && a.amenities_Id) // Filter out invalid amenities
          .map(a => a.amenities_Id)
          .join(',')
      : "";
    
    // Create the API payload based on the required schema
    const apiPayload = {
      comId: actualCompanyId || 0,
      typeId: formData.aircraftType?.id || 0,
      aircraftTypeName: formData.type || "",
      tailMaxPax: parseInt(formData.seats) || 0,
      othertags: rolesString,
      modelS: formData.modeS || "",
      slNo: formData.registration || "",
      tail: formData.registration || "", // Add tail field to match the API field where registration is stored
      yom: parseInt(formData.yom) || 0,
      yor: parseInt(formData.yor) || 0,
      currency: formData.currency || "USD",
      perHr: parseInt(formData.perHour) || 0,
      taxyTime: taxyTimeDecimal || 0,
      amenities: amenitiesString,
      images: imagesString,
      displayImages: imagesString, // Using same images for display
      base: formData.base || "",
      // Use the explicitly stored lat/long values if available, otherwise try to get from baseObject
      baseLat: formData.baseLat || (formData.baseObject?.lat || formData.baseObject?.latitude || 0),
      baselong: formData.baseLong || (formData.baseObject?.long || formData.baseObject?.longitude || 0),
      airworthinessValidity: formData.airworthinessDate || new Date().toISOString(),
      insuranceValidity: formData.insuranceDate || new Date().toISOString(),
      baggage: "",
      mtoWkg: parseInt(formData.mtow) || 0,
      isWide: false,
      operatorId: actualCompanyId || 0,
      pricingProfilesId: "",
      chargesId: "",
      breakdown: true,
      pricing: true,
      // Add the required model field
      model: formData.type || ""
    };
    
    // Add id field for update operations
    if (mode === 'edit' && formData.id) {
      apiPayload.id = formData.id;
      console.log('Edit mode - adding ID to payload:', formData.id);
    }
    
    console.log('API Payload:', apiPayload);
    
    // For update mode, add ID to the URL as a query parameter
    const url = new URL(apiEndpoint);
    if (mode === 'edit' && formData.id) {
      url.searchParams.append('id', formData.id);
      url.searchParams.append('comId', actualCompanyId);
    }
    
    // Make sure isActive is set for UpdateTail
    const finalPayload = {
      ...apiPayload,
      isActive: true
    };
    
    // For update mode, explicitly construct the URL with all required parameters
    let apiUrl = apiEndpoint;
    if (mode === 'edit' && formData.id) {
      // Build the URL with query parameters directly for more reliable behavior
      apiUrl = `${API_BASE_URL}/api/SinglePoint/UpdateTail?id=${formData.id}&tailId=${formData.id}&comId=${actualCompanyId}`;
      console.log('Final API URL:', apiUrl);
    }
    
    // Ensure critical fields don't have zero values as those might be treated as missing
    const ensureNonZero = (value, defaultValue = 1) => {
      return value === 0 ? defaultValue : value;
    };
    
    // Apply to critical numeric fields that should never be zero
    if (finalPayload.tailMaxPax === 0 || finalPayload.tailMaxPax === null) finalPayload.tailMaxPax = 1;
    if (finalPayload.yom === 0 || finalPayload.yom === null) finalPayload.yom = new Date().getFullYear();
    if (finalPayload.perHr === 0 || finalPayload.perHr === null) finalPayload.perHr = 1;
    
    // CRITICAL: Ensure all numeric fields are actually numbers, not strings
    const numericFields = ['id', 'tailId', 'comId', 'perHr', 'tailMaxPax', 'yom', 'yor', 'taxyTime', 'baseLat', 'baselong', 'mtoWkg'];
    numericFields.forEach(field => {
      if (finalPayload[field] !== undefined && finalPayload[field] !== null) {
        if (typeof finalPayload[field] === 'string') {
          console.log(`Converting string to number for field: ${field}`);
          finalPayload[field] = Number(finalPayload[field]) || 0;
        }
      }
    });
    
    // Special check for model field - it's critical and must not be empty
    if (!finalPayload.model || finalPayload.model.trim() === '') {
      console.error('MODEL FIELD IS EMPTY - this is a critical field');
      finalPayload.model = finalPayload.aircraftTypeName || "Unknown Aircraft";
      console.log('Set model field to:', finalPayload.model);
    }
    
    // Log the final payload for debugging
    console.log('Final API Payload:', JSON.stringify(finalPayload, null, 2));
    
    // Add detailed debugging information in an organized format
    console.log('========= API REQUEST DETAILS =========');
    console.log('URL:', apiUrl);
    console.log('PAYLOAD SUMMARY:');
    console.log('- ID fields:', { 
      id: finalPayload.id, 
      tailId: finalPayload.tailId, 
      comId: finalPayload.comId 
    });
    console.log('- Aircraft info:', { 
      type: finalPayload.aircraftTypeName, 
      model: finalPayload.model,
      registration: finalPayload.slNo,
      seats: finalPayload.tailMaxPax,
      yom: finalPayload.yom
    });
    console.log('- Location info:', { 
      base: finalPayload.base, 
      baseLat: finalPayload.baseLat, 
      baselong: finalPayload.baselong 
    });
    console.log('- Pricing info:', { 
      currency: finalPayload.currency, 
      perHr: finalPayload.perHr, 
      taxyTime: finalPayload.taxyTime 
    });
    console.log('====================================');
    
    axios.post(
      apiUrl,
      finalPayload,
      {
        headers: getAuthHeaders(),
        timeout: 30000 // 30 second timeout
      }
    )
    .then(response => {
      console.log('API Response:', response);
      if (response.data && response.data.success) {
        // Update the formData with the returned ID if needed
        const newId = response.data.data?.id || formData.id || Date.now();
        console.log('Operation successful! New/updated tail ID:', newId);
        
        // For UI display, prepare the fleet data
        const fleetData = {
          ...formData,
          id: newId,
          roles: formData.roles.map(role => role.text),
          tail: formData.registration,
          slNo: formData.registration, // Add slNo field for API consistency
          aircraft_Type_Name: formData.type,
          rate: formData.perHour,
          blocked: formData.na,
          tail_Max_Pax: formData.seats,
          images: [
            formData.exteriorImage, 
            ...(Array.isArray(formData.otherImages) ? formData.otherImages : [])
          ].filter(Boolean),
          amenities: amenitiesString,
          amenitiesObjects: formData.amenities && Array.isArray(formData.amenities)
            ? formData.amenities.filter(a => a && typeof a === 'object' && a.amenities_Id)
            : []
        };
        
        // Update the parent component with the saved data - force close form to refresh table
        onSave(fleetData, true);
      } else {
        console.error('API Error:', response.data?.message || 'Unknown error');
        // Log detailed information about the error
        console.error('API returned success: false. Full response:', response.data);
        
        // Try to identify which required fields might be missing
        console.error('POSSIBLE MISSING FIELDS:');
        const criticalFields = ['id', 'tailId', 'comId', 'model', 'slNo', 'base', 'perHr', 'currency', 'tailMaxPax', 'yom'];
        criticalFields.forEach(field => {
          if (!finalPayload[field] || 
             (typeof finalPayload[field] === 'string' && finalPayload[field].trim() === '') ||
             (typeof finalPayload[field] === 'number' && finalPayload[field] === 0)) {
            console.error(`- ${field}: ${finalPayload[field]} (${typeof finalPayload[field]})`);
          }
        });
        
        // Show alert to user
        setApiError(response.data?.message || 'Failed to add aircraft. Please try again.');
      }
    })
    .catch(error => {
      console.error('API Error:', error);
      console.error('Error details:', error.response?.data);
      setApiError(`Error: ${error.message || 'Unknown error'}`);
    });
  };
  
  // Add validation function for each step
  const validateStep = (currentStep) => {
    const errors = {};
    
    // Helper function to safely check if a value is empty (works for both strings and numbers)
    const isEmpty = (value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (typeof value === 'number') return false; // Numbers are never empty
      return true; // Any other type is considered empty
    };
    
    switch(currentStep) {
      case 1:
        // Basic details validation
        if (isEmpty(formData.registration)) {
          errors.registration = 'Registration is required';
        }
        
        if (isEmpty(formData.type)) {
          errors.type = 'Aircraft type is required';
        }
        
        if (!formData.roles || formData.roles.length === 0) {
          errors.roles = 'At least one role is required';
        }
        
        if (isEmpty(formData.yom)) {
          errors.yom = 'Year of manufacture is required';
        }
        
        if (isEmpty(formData.seats)) {
          errors.seats = 'Number of seats is required';
        }
        break;
        
      case 2:
        // Pricing validation
        if (isEmpty(formData.base)) {
          errors.base = 'Base is required';
        }
        
        if (isEmpty(formData.currency)) {
          errors.currency = 'Currency is required';
        }
        
        if (isEmpty(formData.perHour)) {
          errors.perHour = 'Per hour rate is required';
        }
        
        if (isEmpty(formData.taxyTime)) {
          errors.taxyTime = 'Taxy time is required';
        }
        
        // Add validation for coordinates
        if (formData.base && (!formData.baseLat || !formData.baseLong)) {
          errors.base = 'Base location coordinates are missing. Please select a valid airport.';
        }
        break;
        
      case 3:
        // Images validation
        if (isEmpty(formData.exteriorImage)) {
          errors.exteriorImage = 'Exterior image is required';
        }
        break;
        
      case 4:
        // No strict validation for step 4 (documents)
        break;
        
      default:
        break;
    }
    
    return errors;
  };
  
  // Update nextStep function to validate before proceeding
  const nextStep = () => {
    // Validate the current step
    const errors = validateStep(step);
    
    // If there are validation errors, show them and prevent moving to next step
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      return; // Stop here - don't proceed to next step
    }
    
    // Clear any previous validation errors
    setValidationErrors({});
    setShowValidationErrors(false);
    
    // If we're on step 3 and moving to step 4, call the API before advancing
    if (step === 3) {
      // Set loading state
      setIsSubmitting(true);
      setApiError(null);
      
      // IMPORTANT: First advance to step 4 immediately, then make the API call
      // This ensures we always reach step 4 regardless of API success
    setStep(step + 1);
      
      // Convert form data to the format expected by the API
      const apiEndpoint = mode === 'add' 
        ? `${API_BASE_URL}/api/SinglePoint/AddTail`
        : `${API_BASE_URL}/api/SinglePoint/UpdateTail`;
      
      // Convert taxyTime from HH:MM format to decimal hours if needed
      let taxyTimeDecimal = formData.taxyTime;
      if (formData.taxyTime && formData.taxyTime.includes(':')) {
        const [hours, minutes] = formData.taxyTime.split(':').map(Number);
        taxyTimeDecimal = hours + (minutes / 60);
      }
      
      // Ensure images are properly formatted as a string
      let imagesString = '';
      if (formData.exteriorImage || (Array.isArray(formData.otherImages) && formData.otherImages.length > 0)) {
        const imageArray = [
        formData.exteriorImage, 
        ...(Array.isArray(formData.otherImages) ? formData.otherImages : [])
        ].filter(Boolean);
        imagesString = imageArray.join(',');
      }
      
      // Add this code here
      // Format roles into a comma-separated string
      const rolesString = formData.roles.length > 0 
        ? formData.roles.map(r => r.text).join(',') 
        : "";
      
      // Format amenities into a comma-separated string of IDs
      const amenitiesString = formData.amenities && Array.isArray(formData.amenities) && formData.amenities.length > 0
        ? formData.amenities
            .filter(a => a && typeof a === 'object' && a.amenities_Id) // Filter out invalid amenities
            .map(a => a.amenities_Id)
            .join(',')
        : "";
      
      // Create the API payload based on the required schema
      const apiPayload = {
        comId: actualCompanyId || 0,
        typeId: formData.aircraftType?.id || 0,
        aircraftTypeName: formData.type || "",
        tailMaxPax: parseInt(formData.seats) || 0,
        othertags: rolesString,
        modelS: formData.modeS || "",
        slNo: formData.registration || "",
        tail: formData.registration || "", // Add tail field to match the API field where registration is stored
        yom: parseInt(formData.yom) || 0,
        yor: parseInt(formData.yor) || 0,
        currency: formData.currency || "USD",
        perHr: parseInt(formData.perHour) || 0,
        taxyTime: taxyTimeDecimal || 0,
        amenities: amenitiesString,
        images: imagesString,
        displayImages: imagesString, // Using same images for display
        base: formData.base || "",
        // Use the explicitly stored lat/long values if available, otherwise try to get from baseObject
        baseLat: formData.baseLat || (formData.baseObject?.lat || formData.baseObject?.latitude || 0),
        baselong: formData.baseLong || (formData.baseObject?.long || formData.baseObject?.longitude || 0),
        airworthinessValidity: formData.airworthinessDate || new Date().toISOString(),
        insuranceValidity: formData.insuranceDate || new Date().toISOString(),
        baggage: "",
        mtoWkg: parseInt(formData.mtow) || 0,
        isWide: false,
        operatorId: actualCompanyId || 0,
        pricingProfilesId: "",
        chargesId: "",
        breakdown: true,
        pricing: true,
        // Add the required model field
        model: formData.type || ""
      };
      
      // Add id field for update operations
      if (mode === 'edit' && formData.id) {
        // For edit operations, we must include the ID
        if (formData.id) {
        apiPayload.id = formData.id;
          console.log('Edit mode - adding ID to payload:', formData.id);
        } else {
          console.error('Edit mode but no ID found in formData!');
        }
      }
      
      console.log('API Payload:', apiPayload);
      
      // Call the API in the background with retry logic
      const makeApiCall = (retryCount = 0) => {
        console.log(`Making ${mode === 'add' ? 'Add' : 'Update'} API call to ${apiEndpoint}`);
        
        // For update mode, explicitly construct the URL with all required parameters
        let apiUrl = apiEndpoint;
        if (mode === 'edit' && formData.id) {
          // Build the URL with query parameters directly for more reliable behavior
          apiUrl = `${API_BASE_URL}/api/SinglePoint/UpdateTail?id=${formData.id}&tailId=${formData.id}&comId=${actualCompanyId}`;
          console.log('Final API URL:', apiUrl);
        }
        
        // Choose payload based on operation
        let finalPayload;
        
        // For updates, create a minimal payload with only required fields
        if (mode === 'edit' && formData.id) {
          // In edit mode, ensure ALL possible required fields are included with null as fallback
          finalPayload = {
            // Required fields with safe fallbacks for numeric fields
            id: formData.id || 0,
            tailId: formData.id || 0,
            comId: actualCompanyId || 0,
            model: formData.type || "Unknown Model",
            aircraftTypeName: formData.type || "Unknown Type",
            slNo: formData.registration || "Unregistered",
            base: formData.base || "LFPG", // Default to Paris Charles de Gaulle if empty
            perHr: parseInt(formData.perHour) || 1000, // Default to 1000 if missing
            taxyTime: taxyTimeDecimal || 0.5, // Default to 30 minutes
            currency: formData.currency || "USD",
            tailMaxPax: parseInt(formData.seats) || 1, // Default to 1 passenger
            yom: parseInt(formData.yom) || new Date().getFullYear(), // Default to current year
            yor: parseInt(formData.yor) || new Date().getFullYear(),
            othertags: rolesString || "Charter", // Default to Charter tag
            
            // Location fields with defaults to prevent coordinate errors
            baseLat: formData.baseLat || 48.866667, // Default Paris coordinates
            baselong: formData.baseLong || 2.333333,
            
            // Required flags
            isActive: true,
            blocked: formData.na || false,
            
            // Additional fields with sensible defaults
            airworthinessValidity: formData.airworthinessDate || new Date().toISOString(),
            insuranceValidity: formData.insuranceDate || new Date().toISOString(),
            images: imagesString || "",
            displayImages: imagesString || "",
            amenities: amenitiesString || "",
            baggage: formData.baggage || "",
            mtoWkg: parseInt(formData.mtow) || 1000, // Default MTOW
            modelS: formData.modeS || "",
            
            // Pricing related fields
            typeId: formData.aircraftType?.id || 0,
            operatorId: actualCompanyId || 0,
            pricingProfilesId: "",
            chargesId: "",
            breakdown: true,
            pricing: true,
            isWide: false
          };
          
          // Log the complete payload to verify all fields are included
          console.log('Complete Update Payload:', finalPayload);
        } else {
          // For add mode, we need to send all fields
          finalPayload = {
            ...apiPayload,
            isActive: true
          };
        }
        
        // Log the final payload for debugging
        console.log('Final API Payload:', JSON.stringify(finalPayload));
        
        // CRITICAL: Ensure all numeric fields are actually numbers, not strings
        const numericFields = ['id', 'tailId', 'comId', 'perHr', 'tailMaxPax', 'yom', 'yor', 'taxyTime', 'baseLat', 'baselong', 'mtoWkg'];
        numericFields.forEach(field => {
          if (finalPayload[field] !== undefined && finalPayload[field] !== null) {
            if (typeof finalPayload[field] === 'string') {
              console.log(`Converting string to number for field: ${field}`);
              finalPayload[field] = Number(finalPayload[field]) || 0;
            }
          }
        });
        
        // Special check for model field - it's critical and must not be empty
        if (!finalPayload.model || finalPayload.model.trim() === '') {
          console.error('MODEL FIELD IS EMPTY - this is a critical field');
          finalPayload.model = finalPayload.aircraftTypeName || "Unknown Aircraft";
          console.log('Set model field to:', finalPayload.model);
        }
        
        axios.post(
          apiUrl,
          finalPayload,
          {
            headers: getAuthHeaders(),
            timeout: 30000 // 30 second timeout
          }
        )
        .then(response => {
          console.log('API Response:', response);
          setIsSubmitting(false);
          
          if (response.data && response.data.success) {
            setApiSuccess(true);
            console.log('API call successful, response data:', response.data);
            
            // Get the tail ID from the response
            const tailId = response.data.data?.id || formData.id;
            console.log('Using tail ID:', tailId);
            
            // Update the formData with the returned ID
            if (tailId) {
              setFormData(prev => ({
                ...prev,
                id: tailId
              }));
              
              // If there are any documents already uploaded, register them with the new tail ID
              if (Array.isArray(formData.documents) && formData.documents.length > 0) {
                console.log(`Saving ${formData.documents.length} documents with new tail ID: ${tailId}`);
                formData.documents.forEach(doc => {
                  saveDocumentToAPI(doc.type || "document", doc.url, tailId);
                });
              }
            }
            
            // For UI display, prepare the fleet data
            const fleetData = {
              ...formData,
              id: tailId || Date.now(),
              roles: formData.roles.map(role => role.text),
              tail: formData.registration,
              slNo: formData.registration, // Add slNo field for API consistency
              aircraft_Type_Name: formData.type,
              rate: formData.perHour,
              blocked: formData.na,
              tail_Max_Pax: formData.seats,
              images: [
                formData.exteriorImage, 
                ...(Array.isArray(formData.otherImages) ? formData.otherImages : [])
              ].filter(Boolean),
              amenities: amenitiesString,
              amenitiesObjects: formData.amenities && Array.isArray(formData.amenities)
                ? formData.amenities.filter(a => a && typeof a === 'object' && a.amenities_Id)
                : []
            };
            
            // Update the parent component with the saved data, but don't close the form
            // We'll save the data but stay on step 4
            if (onSave) {
              onSave(fleetData, false); // Keep form open but update parent component data
            }
          } else {
            // API returned 200 but with success: false in the response body
            console.error('API Error:', response.data?.message || 'Unknown error');
            setApiError(response.data?.message || 'Failed to add aircraft. Please try again.');
            
            // Log detailed information about the error
            console.error('API returned success: false. Full response:', response.data);
            
            // Try to identify which required fields might be missing
            console.error('POSSIBLE MISSING FIELDS:');
            const criticalFields = ['id', 'tailId', 'comId', 'model', 'slNo', 'base', 'perHr', 'currency', 'tailMaxPax', 'yom'];
            criticalFields.forEach(field => {
              if (!finalPayload[field] || 
                (typeof finalPayload[field] === 'string' && finalPayload[field].trim() === '') ||
                (typeof finalPayload[field] === 'number' && finalPayload[field] === 0)) {
                console.error(`- ${field}: ${finalPayload[field]} (${typeof finalPayload[field]})`);
              }
            });
            
            // Even if there's an error, we stay on step 4
            // The error will be displayed in step 4, and the user can try again
          }
        })
        .catch(error => {
          console.error('API Error:', error);
          console.log('Error details:', error.response?.data);
          
          // Check if we should retry (max 2 retries, so 3 attempts total)
          if (retryCount < 2) {
            console.log(`Retrying API call (attempt ${retryCount + 2})...`);
            setTimeout(() => makeApiCall(retryCount + 1), 2000); // Wait 2 seconds before retrying
          } else {
            setIsSubmitting(false);
            
            let errorMessage = 'Failed to connect to server. Please check your internet connection.';
            if (error.response) {
              // The request was made and the server responded with an error status
              console.log('Error response data:', error.response.data);
              
              // Log more detailed information about the error
              if (error.response.data?.message === 'One or more required fields are missing.') {
                console.error('Required fields missing in payload. Payload sent:', JSON.stringify(finalPayload, null, 2));
                
                // ENHANCED ERROR DIAGNOSTICS
                // Check common required fields and log which ones are missing or have problematic values
                console.log('DETAILED MISSING FIELDS ANALYSIS:');
                
                // Define all possible required fields with their expected types
                const requiredFieldSpecs = [
                  { name: 'id', type: 'number', canBeZero: false },
                  { name: 'tailId', type: 'number', canBeZero: false },
                  { name: 'comId', type: 'number', canBeZero: false },
                  { name: 'model', type: 'string', nonEmpty: true },
                  { name: 'aircraftTypeName', type: 'string', nonEmpty: true },
                  { name: 'slNo', type: 'string', nonEmpty: true },
                  { name: 'base', type: 'string', nonEmpty: true },
                  { name: 'perHr', type: 'number', canBeZero: false },
                  { name: 'taxyTime', type: 'number', canBeZero: true },
                  { name: 'currency', type: 'string', nonEmpty: true },
                  { name: 'tailMaxPax', type: 'number', canBeZero: false },
                  { name: 'yom', type: 'number', canBeZero: false },
                  { name: 'othertags', type: 'string' },
                  { name: 'baseLat', type: 'number' },
                  { name: 'baselong', type: 'number' },
                  { name: 'isActive', type: 'boolean' }
                ];
                
                // Check each field against specifications
                const missingFields = [];
                const emptyFields = [];
                const wrongTypeFields = [];
                const zeroValueFields = [];
                
                requiredFieldSpecs.forEach(spec => {
                  const fieldName = spec.name;
                  const fieldValue = finalPayload[fieldName];
                  
                  // Check if field exists
                  if (fieldValue === undefined || fieldValue === null) {
                    missingFields.push(fieldName);
                    console.error(`MISSING: ${fieldName} is null or undefined`);
                    return;
                  }
                  
                  // Check correct type
                  const actualType = typeof fieldValue;
                  if (actualType !== spec.type) {
                    wrongTypeFields.push(`${fieldName} (expected ${spec.type}, got ${actualType})`);
                    console.error(`TYPE ERROR: ${fieldName} should be ${spec.type} but is ${actualType}`);
                    return;
                  }
                  
                  // Check for empty strings
                  if (spec.type === 'string' && spec.nonEmpty && fieldValue.trim() === '') {
                    emptyFields.push(fieldName);
                    console.error(`EMPTY: ${fieldName} is an empty string`);
                    return;
                  }
                  
                  // Check for zero values that shouldn't be zero
                  if (spec.type === 'number' && !spec.canBeZero && fieldValue === 0) {
                    zeroValueFields.push(fieldName);
                    console.error(`ZERO: ${fieldName} is 0 but should have a non-zero value`);
                    return;
                  }
                });
                
                // Extra check for coordinate fields
                if ((finalPayload.base && !finalPayload.baseLat) || (finalPayload.base && !finalPayload.baselong)) {
                  console.error('COORDINATES MISSING: Base location is specified but coordinates are missing or zero');
                }
                
                // Log the final analysis
                console.log('MISSING FIELDS SUMMARY:');
                console.log('- Missing fields:', missingFields.length > 0 ? missingFields : 'None');
                console.log('- Empty string fields:', emptyFields.length > 0 ? emptyFields : 'None');
                console.log('- Wrong type fields:', wrongTypeFields.length > 0 ? wrongTypeFields : 'None');
                console.log('- Zero value fields:', zeroValueFields.length > 0 ? zeroValueFields : 'None');
                
                // Create a comprehensive error message
                if (missingFields.length > 0 || emptyFields.length > 0 || wrongTypeFields.length > 0 || zeroValueFields.length > 0) {
                  // Create a comprehensive error message for the console
                  let consoleErrorMessage = '';
                  
                  if (missingFields.length > 0) {
                    consoleErrorMessage += `Missing required fields: ${missingFields.join(', ')}`;
                  }
                  
                  if (emptyFields.length > 0) {
                    consoleErrorMessage += (consoleErrorMessage ? ' | ' : '') + `Empty fields: ${emptyFields.join(', ')}`;
                  }
                  
                  if (wrongTypeFields.length > 0) {
                    consoleErrorMessage += (consoleErrorMessage ? ' | ' : '') + `Type errors: ${wrongTypeFields.join(', ')}`;
                  }
                  
                  if (zeroValueFields.length > 0) {
                    consoleErrorMessage += (consoleErrorMessage ? ' | ' : '') + `Zero values: ${zeroValueFields.join(', ')}`;
                  }
                  
                  console.error('Error summary:', consoleErrorMessage);
                  
                  // Use the structured format for the UI
                  setApiError({
                    message: 'One or more required fields are missing or invalid',
                    details: {
                      missing: missingFields,
                      empty: emptyFields,
                      wrongType: wrongTypeFields,
                      zeroValues: zeroValueFields
                    }
                  });
                } else {
                  // Use simple format for other error types
                  setApiError(error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`);
                }
              } else {
                errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
              }
            } else if (error.request) {
              // The request was made but no response was received
              errorMessage = 'No response from server. Please try again.';
            }
            
            // Use structured format for all errors
            setApiError({
              message: errorMessage,
              details: {
                apiError: true,
                statusCode: error.response?.status,
                errorInfo: error.message
              }
            });
            
            setIsSubmitting(false);
            
            // Even if there's an error, we stay on step 4
            // The error will be displayed in step 4, and the user can try again
          }
        });
      };
      
      // Start the API call process
      makeApiCall();
    } else {
      // For other steps, just move to the next step
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <div className={`flex items-center justify-center rounded-full w-8 h-8 ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="h-1 w-12 bg-gray-200 mx-2"></div>
            <div className={`flex items-center justify-center rounded-full w-8 h-8 ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className="h-1 w-12 bg-gray-200 mx-2"></div>
            <div className={`flex items-center justify-center rounded-full w-8 h-8 ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className="h-1 w-12 bg-gray-200 mx-2"></div>
            <div className={`flex items-center justify-center rounded-full w-8 h-8 ${step === 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
          </div>
          <div className="flex mt-2 text-xs text-gray-500">
            <div className="w-8 text-center">Basic Details</div>
            <div className="w-12 mx-2"></div>
            <div className="w-8 text-center">Pricing</div>
            <div className="w-12 mx-2"></div>
            <div className="w-8 text-center">Images</div>
            <div className="w-12 mx-2"></div>
            <div className="w-8 text-center">Documents</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Filter aircraft types based on search
  useEffect(() => {
    if (aircraftTypeSearch.length > 0) {
      setIsAircraftTypeOpen(true);
    }
  }, [aircraftTypeSearch]);

  // Filter aircraft types based on search
  const filteredAircraftTypes = aircraftTypeSearch.length > 0
    ? aircraftTypes.filter(type => 
        type.name.toLowerCase().includes(aircraftTypeSearch.toLowerCase())
      )
    : aircraftTypes.slice(0, 5); // Show first 5 items when no search term
  
  // Filter roles based on search
  const filteredRoles = roles;
  
  // Convert taxy time to decimal
  const convertTaxyTime = (time) => {
    if (!time) return '';
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number);
      return (hours + minutes / 60).toFixed(2);
    }
    return time;
  };

  // Format decimal to time
  const formatToTime = (decimal) => {
    if (!decimal) return '';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Update taxy time input handler to clear validation on change
  const handleTaxyTimeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      taxyTime: value,
      taxyTimeDecimal: convertTaxyTime(value)
    }));
    
    // Clear taxyTime validation error if field is now valid
    if (value && validationErrors.taxyTime) {
      clearValidationError('taxyTime');
    }
  };
  
  // Add effect for currency search
  useEffect(() => {
    if (currencySearch.length > 0) {
      setIsCurrencyOpen(true);
    }
  }, [currencySearch]);

  // Add effect for handling clicks outside currency dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add currency selection handler
  const handleCurrencySelect = (currency) => {
    setFormData(prev => ({ 
      ...prev, 
      currency: currency.currency_symbole,
      currencyName: currency.currency_name,
      currencyObject: currency
    }));
    setCurrencySearch(currency.currency_name);
    setIsCurrencyOpen(false);
  };

  // Filter currencies based on search
  const filteredCurrencies = currencySearch.length > 0
    ? currencies.filter(currency => 
        currency.currency_name.toLowerCase().includes(currencySearch.toLowerCase()) ||
        currency.currency_symbole.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : currencies.slice(0, 5); // Show first 5 items when no search term
  
  // Handle exterior image upload
  const handleExteriorImageUpload = async (event) => {
    const file = event.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file);
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    const formData = new FormData();
      formData.append('files', compressedFile);
    
      const response = await axios.post(
        `${API_BASE_URL}/api/SinglePoint/UploadFile?folderName=FleetImages&tier=cool`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
          timeout: 30000 // Add a 30 second timeout to prevent hanging requests
        }
      );
      
      let imageUrl = null;
      
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          imageUrl = response.data[0];
        } else if (response.data.success && response.data.data) {
          imageUrl = response.data.data;
        } else if (typeof response.data === 'string') {
          imageUrl = response.data;
        }
        
        if (imageUrl) {
        setFormData(prev => ({
          ...prev,
            exteriorImage: imageUrl
          }));
          
          // Clear exterior image validation error when image is uploaded
          if (validationErrors.exteriorImage) {
            clearValidationError('exteriorImage');
          }
        }
      }
    } catch (error) {
      console.error('Error uploading exterior image:', error);
      alert('Failed to upload image. Please try again or use a smaller image file.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (exteriorFileUploadRef.current) {
        exteriorFileUploadRef.current.clear();
      }
    }
  };
  
  // Handle other images upload
  const handleOtherImagesUpload = async (event) => {
    setUploading(true);
    
    try {
      // Process all files in the event.files array
      const files = event.files;
      
      // Check if adding these files would exceed the maximum limit of 4
      const currentCount = formData.otherImages ? formData.otherImages.length : 0;
      const remainingSlots = 4 - currentCount;
      
      if (files.length > remainingSlots) {
        // Alert the user that only the first N files will be uploaded
        alert(`Only ${remainingSlots} more image(s) can be uploaded. The first ${remainingSlots} file(s) will be processed.`);
      }
      
      // Process only up to the remaining slots
      const filesToProcess = files.slice(0, remainingSlots);
      setCurrentFileUpload({ current: 1, total: filesToProcess.length });
      
      // Store all new image URLs to update state only once at the end
      const newImageUrls = [];
      
      // Upload each file sequentially
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        // Update progress message to show which file is being uploaded
        setUploadProgress(0);
        setCurrentFileUpload({ current: i + 1, total: filesToProcess.length });
      
        try {
          // Compress the image before uploading
          const compressedFile = await compressImage(file);
          
          // Create FormData for this file
          const formDataObj = new FormData();
          formDataObj.append('files', compressedFile);
          
      const response = await axios.post(
        `${API_BASE_URL}/api/SinglePoint/UploadFile?folderName=FleetImages&tier=cool`,
        formDataObj,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
              },
              timeout: 30000 // Add a 30 second timeout to prevent hanging requests
        }
      );
          
          // Check if the response format is an array or has a data property
          if (response.data) {
            let imageUrl;
            
            if (Array.isArray(response.data)) {
              // If response is an array, take the first item
              imageUrl = response.data[0];
            } else if (response.data.success && response.data.data) {
              // If response has a data property with success flag
              imageUrl = response.data.data;
            } else if (typeof response.data === 'string') {
              // If response is a direct string
              imageUrl = response.data;
            } else {
              console.error("Unexpected response format:", response.data);
              continue; // Skip this file and move to next
            }
            
            if (imageUrl) {
              // Add to our collection of new URLs instead of updating state immediately
              newImageUrls.push(imageUrl);
            }
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
        }
      }
      
      // Update state once with all new images
      if (newImageUrls.length > 0) {
        setFormData(prev => {
          const existingImages = Array.isArray(prev.otherImages) ? prev.otherImages : [];
                return {
          ...prev,
            otherImages: [...existingImages, ...newImageUrls],
            lastUpdated: new Date().getTime() // Force a re-render
                };
              });
              
              // Increment the counter to force a re-render
              setImagesUpdateCounter(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileUpload({ current: 0, total: 0 });
      
      // Clear the file input to allow selecting the same files again if needed
      if (otherImagesFileUploadRef.current) {
        otherImagesFileUploadRef.current.clear();
      }
    }
  };
  
  // Handle image preview
  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowImagePreview(true);
  };
  
  // Handle delete exterior image
  const handleDeleteExteriorImage = () => {
    setFormData(prev => ({
      ...prev,
      exteriorImage: ''
    }));
  };
  
  // Handle delete other image
  const handleDeleteOtherImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      otherImages: prev.otherImages.filter(url => url !== imageUrl)
    }));
  };

  // Update the saveDocumentToAPI function to be more efficient and handle timeouts
  const saveDocumentToAPI = async (docType, url, tailId) => {
    if (!tailId) {
      console.error('Cannot save document: No tail ID available');
      return false;
    }
    
    try {
      console.log(`Saving document to API with tail ID: ${tailId}`, {docType, url});
      
      // Convert tailId to number if it's a string
      const numericTailId = parseInt(tailId, 10);
      
      if (isNaN(numericTailId)) {
        console.error('Invalid tail ID (not a number):', tailId);
        return false;
      }
      
      const payload = {
        conversationId: 0,
        personId: 0,
        crmCompanyId: 0,
        tailId: numericTailId,
        piplineId: 0,
        isPrivate: true,
        files: [
          {
            docType: docType || "document",
            url: url
          }
        ]
      };
      
      console.log('AddConversationFiles API payload:', JSON.stringify(payload));
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await axios.post(
        `${API_BASE_URL}/api/SinglePoint/AddConversationFiles`,
        payload,
        {
          headers: getAuthHeaders(),
          signal: controller.signal
        }
      );
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      console.log('AddConversationFiles API response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Document saved successfully:', response.data);
        
        // Update document status in formData
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.url === url ? { ...doc, status: 'saved', apiId: response.data.data[0]?.id } : doc
          )
        }));
        
        return true;
      } else {
        console.error('API error saving document:', response.data?.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout reached when saving document');
        // Mark as failed but don't crash the app
        return false;
      }
      
      console.error('Error saving document to API:', error);
      console.error('Error details:', error.response?.data);
      return false;
    }
  };

  // Function to check file size and provide warning for large files
  const checkFileSize = (file) => {
    const maxRecommendedSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxRecommendedSize) {
      console.warn(`Large file detected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). This may upload slowly.`);
      return false;
    }
    return true;
  };

  // Add function to optimize document files (compress images)
  const optimizeDocumentFile = async (file) => {
    // Only process image files, leave PDFs and other docs as is
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Only compress if image is larger than 1600px width or 2MB
          if (img.width <= 1600 && file.size < 2 * 1024 * 1024) {
            resolve(file); // No need to compress
            return;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max width 1600px)
          const maxWidth = 1600;
          const maxHeight = 1600;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          // Resize image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to file with reduced quality
          canvas.toBlob(
            (blob) => {
              const optimizedFile = new File(
                [blob], 
                file.name, 
                { type: file.type, lastModified: Date.now() }
              );
              
              console.log(`Optimized image: ${file.name} from ${(file.size/1024/1024).toFixed(2)}MB to ${(optimizedFile.size/1024/1024).toFixed(2)}MB`);
              resolve(optimizedFile);
            },
            file.type,
            0.85 // 85% quality - good balance between size and quality
          );
        };
        
        img.onerror = () => {
          console.error('Error loading image for optimization');
          resolve(file); // Return original on error
        };
      };
      
      reader.onerror = () => {
        console.error('Error reading file for optimization');
        resolve(file); // Return original on error
      };
    });
  };

  // Update document upload handler with optimizations
  const handleDocumentUpload = async (event) => {
    setUploadingDoc(true);
    setDocUploadProgress(0);
    
    try {
      const file = event.files[0];
      if (!file) {
        setUploadingDoc(false);
        return;
      }
      
      console.log('Starting document upload:', file.name, `(${(file.size/1024/1024).toFixed(2)}MB)`);
      
      // Check if file is too large and show warning
      const isLargeFile = !checkFileSize(file);
      if (isLargeFile) {
        console.log('Large file detected, this may take longer to upload');
      }
      
      // Determine document type from filename or extension
      let docType = "document";
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('insurance') || fileName.includes('ins')) {
        docType = "insurance";
      } else if (fileName.includes('airworth') || fileName.includes('aw')) {
        docType = "airworthiness";
      } else if (fileName.includes('registration') || fileName.includes('reg') || fileName.includes('cor')) {
        docType = "registration";
      }
      
      // Optimize the file if it's an image
      console.log('Optimizing document file if needed...');
      const optimizedFile = await optimizeDocumentFile(file);
      
      // Create FormData
      const formDataObj = new FormData();
      formDataObj.append('files', optimizedFile); // Changed from 'file' to 'files' to match API expectation
      
      console.log('Sending file upload request to UploadFile API');
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for larger files
      
      // Upload the file
      const response = await axios.post(
        `${API_BASE_URL}/api/SinglePoint/UploadFile?folderName=FleetDocuments&tier=cool`,
        formDataObj,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDocUploadProgress(percentCompleted);
          },
          signal: controller.signal
        }
      );
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      console.log('UploadFile API response:', response.data);
      
      // Check the response format - different API endpoints return data in different formats
      let docUrl = '';
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          // New API format returns {success: true, data: "url"}
          docUrl = response.data.data;
          console.log('Found document URL in response.data.data:', docUrl);
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Old API format returns ["url"]
          docUrl = response.data[0];
          console.log('Found document URL in response.data[0]:', docUrl);
        } else {
          console.error('Unexpected response format:', response.data);
          setUploadingDoc(false);
          setDocUploadProgress(0);
          return; // Exit early
        }
      } else {
        console.error('No data in response');
        setUploadingDoc(false);
        setDocUploadProgress(0);
        return; // Exit early
      }
      
        const docName = file.name;
      
      console.log('Adding document to formData:', { url: docUrl, name: docName, type: docType });
        
        // Update formData with the new document
      setFormData(prev => {
        const updatedDocs = Array.isArray(prev.documents) ? 
            [...prev.documents, { url: docUrl, name: docName, type: docType }] : 
          [{ url: docUrl, name: docName, type: docType }];
        
        console.log('Updated documents array:', updatedDocs);
        
        return {
          ...prev,
          documents: updatedDocs
        };
      });
        
        // If we're on step 4 and already have a tail ID, immediately save to the API
        if (step === 4 && formData.id) {
        console.log(`Step 4: Immediately saving document with tail ID: ${formData.id}`);
        await saveDocumentToAPI(docType, docUrl, formData.id);
      } else {
        console.log('Document added to form data, will be saved when tail is created');
      }
      
      // Reset upload state
      setUploadingDoc(false);
      setDocUploadProgress(0);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Document upload timeout reached after 60 seconds');
        // Show timeout error
        setValidationErrors(prev => ({
          ...prev,
          documentUpload: 'Upload timed out. Try with a smaller file or check your connection.'
        }));
      } else {
      console.error('Error uploading document:', error);
        console.error('Error details:', error.response?.data);
        
        // Set generic error message
        setValidationErrors(prev => ({
          ...prev,
          documentUpload: 'Failed to upload document. Please try again.'
        }));
      }
    
      setUploadingDoc(false);
      setDocUploadProgress(0);
      if (documentFileUploadRef.current) {
        documentFileUploadRef.current.clear();
      }
    }
  };

  // Optimize the batch document saving function
  const saveAllDocuments = async (documents, tailId) => {
    if (!tailId || !documents || documents.length === 0) {
      return;
    }
    
    setUploadingDoc(true);
    
    try {
      // Create a more efficient payload with all documents in a single request
      const files = documents.map(doc => ({
        docType: doc.type || "document",
        url: doc.url
      }));
      
      const numericTailId = parseInt(tailId, 10);
      if (isNaN(numericTailId)) {
        throw new Error('Invalid tail ID (not a number)');
      }
      
      const payload = {
        conversationId: 0,
        personId: 0,
        crmCompanyId: 0,
        tailId: numericTailId,
        piplineId: 0,
        isPrivate: true,
        files: files
      };
      
      console.log('Batch saving documents API payload:', JSON.stringify(payload));
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      const response = await axios.post(
        `${API_BASE_URL}/api/SinglePoint/AddConversationFiles`,
        payload,
        {
          headers: getAuthHeaders(),
          signal: controller.signal
        }
      );
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      console.log('Batch document save API response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('All documents saved successfully:', response.data);
        
        // Update all documents status in formData
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map(doc => {
            // If this doc is in the batch we just saved, mark it as saved
            if (documents.some(savedDoc => savedDoc.url === doc.url)) {
              return { ...doc, status: 'saved' };
            }
            return doc;
          })
        }));
        
        return true;
      } else {
        console.error('API error saving documents:', response.data?.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout reached when batch saving documents');
      }
      console.error('Error batch saving documents:', error);
      return false;
    } finally {
      setUploadingDoc(false);
    }
  };

  // Add function to delete document from API
  const deleteDocumentFromAPI = async (url, tailId) => {
    if (!tailId) {
      console.error('Cannot delete document: No tail ID available');
      return false;
    }
    
    try {
      console.log(`Deleting document from API with tail ID: ${tailId} and URL: ${url}`);
      
      // The API endpoint for deleting a document
      const response = await axios.delete(
        `${API_BASE_URL}/api/SinglePoint/DeleteConversationFile?url=${encodeURIComponent(url)}&tailId=${tailId}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      if (response.data && response.data.success) {
        console.log('Document deleted successfully:', response.data);
        return true;
      } else {
        console.error('API error deleting document:', response.data?.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting document from API:', error);
      return false;
    }
  };

  // Update document deletion handler
  const handleDeleteDocument = (docUrl) => {
    // If we have a tail ID and we're in step 4, also delete from the API
    if (formData.id && step === 4) {
      deleteDocumentFromAPI(docUrl, formData.id);
    }
    
    // Always update the local state
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.url !== docUrl)
    }));
  };

  // Add effect for base search
  useEffect(() => {
    const searchAirports = async () => {
      if (baseSearch.length < 2) return;
      
      setSearchingAirports(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Markets/SearchAirportByITA_ICO_NAME_LOCATION?globalInput=${baseSearch}`,
          {
            headers: getAuthHeaders()
          }
        );
        
        if (response.data && response.data.success) {
          // Log the first airport to check if coordinates are present
          if (response.data.data && response.data.data.length > 0) {
            console.log('First airport in search results:', response.data.data[0]);
            console.log('Coordinates available:', {
              lat: response.data.data[0].lat,
              long: response.data.data[0].long
            });
          }
          
          setAirports(response.data.data);
          setIsBaseOpen(true);
        }
      } catch (error) {
        console.error('Error searching airports:', error);
      } finally {
        setSearchingAirports(false);
      }
    };
    
    const debounceTimer = setTimeout(searchAirports, 500);
    return () => clearTimeout(debounceTimer);
  }, [baseSearch]);

  // Add effect for handling clicks outside base dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (baseRef.current && !baseRef.current.contains(event.target)) {
        setIsBaseOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update handleBaseSelect to clear validation error
  const handleBaseSelect = (airport) => {
    console.log('Selected airport with coordinates:', airport);
    
    // Check if we have lat/long or latitude/longitude fields
    const latitude = airport.lat !== undefined ? airport.lat : (airport.latitude || 0);
    const longitude = airport.long !== undefined ? airport.long : (airport.longitude || 0);
    
    console.log('Using coordinates:', { latitude, longitude });
    
    setFormData(prev => ({ 
      ...prev, 
      base: airport.icao,
      baseObject: airport,
      // Store coordinates in both formats to ensure compatibility
      baseLat: latitude,
      baseLong: longitude
    }));
    
    setBaseSearch(`${airport.airportName} [${airport.icao}]`);
    setIsBaseOpen(false);
    
    // Clear base validation error
    if (airport.icao && validationErrors.base) {
      clearValidationError('base');
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="mb-6">
              <label htmlFor="registration" className="block mb-1 font-medium text-gray-700">
                Registration*
              </label>
              <small className="block text-gray-500 mb-1">or Tail Number</small>
              <InputText
                id="registration"
                name="registration"
                value={formData.registration}
                onChange={handleInputChange}
                className={`w-full p-2 border ${validationErrors.registration ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="Placeholder"
                required
              />
              {showValidationErrors && validationErrors.registration && (
                <small className="text-red-500">{validationErrors.registration}</small>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="aircraftType" className="block mb-1 font-medium text-gray-700">
                Aircraft Type*
              </label>
              <small className="block text-gray-500 mb-1">Select from List</small>
              <div className="relative" ref={aircraftTypeRef}>
                <div className="flex">
                  <InputText
                    value={aircraftTypeSearch}
                    onChange={(e) => setAircraftTypeSearch(e.target.value)}
                    placeholder="Search aircraft type"
                    className={`w-full p-2 border-2 ${validationErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-l`}
                    onFocus={() => setIsAircraftTypeOpen(true)}
                  />
                  <Button
                    icon="pi pi-chevron-down"
                    className="p-button-primary bg-blue-600 hover:bg-blue-700 rounded-l-none"
                    onClick={() => setIsAircraftTypeOpen(!isAircraftTypeOpen)}
                  />
                </div>
                
                {isAircraftTypeOpen && (
                  <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
                    {loading ? (
                      <div className="p-3 text-center">
                        <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '1rem' }}></i>
                        <div className="mt-1 text-blue-500 text-sm">Loading...</div>
                      </div>
                    ) : filteredAircraftTypes.length > 0 ? (
                      filteredAircraftTypes.map((type, index) => {
                        const isSelected = formData.aircraftType && formData.aircraftType.id === type.id;
                        return (
                          <div
                            key={index}
                            className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              handleAircraftTypeSelect(type);
                              setAircraftTypeSearch(type.name);
                            }}
                          >
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-gray-500">Aircraft Type</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-gray-500">No aircraft types found</div>
                    )}
                  </div>
                )}
              </div>
              {showValidationErrors && validationErrors.type && (
                <small className="text-red-500">{validationErrors.type}</small>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="roles" className="block mb-1 font-medium text-gray-700">
                Roles*
              </label>
              <small className="block text-gray-500 mb-1">Select multiple roles (Note: Medical and Cargo cannot be selected together)</small>
              
              {/* Role selection using MultiSelect component */}
              <MultiSelect
                id="roles"
                value={formData.roles}
                options={roles}
                onChange={(e) => {
                  const selectedRoles = e.value;
                  
                  // Check for Medical and Cargo conflict
                  const hasMedical = selectedRoles.some(r => r.text === 'Medical');
                  const hasCargo = selectedRoles.some(r => r.text === 'Cargo');
                  
                  // If both Medical and Cargo are selected, handle the conflict
                  if (hasMedical && hasCargo) {
                    // Check which one was just added
                    const hadMedicalBefore = formData.roles.some(r => r.text === 'Medical');
                    const hadCargoBefore = formData.roles.some(r => r.text === 'Cargo');
                    
                    if (!hadMedicalBefore) {
                      // Medical was just added, show conflict
                      const medicalRole = selectedRoles.find(r => r.text === 'Medical');
                      setConflictRole(medicalRole);
                      setRoleToReplace('Cargo');
                      setShowRoleConflictDialog(true);
                      return;
                    } else if (!hadCargoBefore) {
                      // Cargo was just added, show conflict
                      const cargoRole = selectedRoles.find(r => r.text === 'Cargo');
                      setConflictRole(cargoRole);
                      setRoleToReplace('Medical');
                      setShowRoleConflictDialog(true);
                      return;
                    }
                  }
                  
                  // If no conflicts, update the form data
                  setFormData(prev => ({
                    ...prev,
                    roles: selectedRoles
                  }));
                  
                  // Clear roles validation error if at least one role is selected
                  if (selectedRoles.length > 0 && validationErrors.roles) {
                    clearValidationError('roles');
                  }
                }}
                optionLabel="text"
                placeholder="Select roles"
                filter
                display="chip"
                className={`w-full ${validationErrors.roles ? 'p-invalid' : ''}`}
                panelClassName="shadow-lg"
                itemTemplate={(role) => {
                  // Check if this role would create a conflict
                  const wouldCreateMedicalConflict = role.text === 'Medical' && formData.roles.some(r => r.text === 'Cargo');
                  const wouldCreateCargoConflict = role.text === 'Cargo' && formData.roles.some(r => r.text === 'Medical');
                  const hasConflict = wouldCreateMedicalConflict || wouldCreateCargoConflict;
                  
                        return (
                    <div className={`${hasConflict ? 'opacity-70' : ''}`}>
                      <span>{role.text}</span>
                      {hasConflict && (
                        <span className="ml-2 text-xs text-red-500">
                          (Conflicts with selected roles)
                        </span>
                      )}
                          </div>
                        );
                }}
              />
              {showValidationErrors && validationErrors.roles && (
                <small className="text-red-500">{validationErrors.roles}</small>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="yom" className="block mb-1 font-medium text-gray-700">
                YOM*
              </label>
              <small className="block text-gray-500 mb-1">Year of Manufacture (Current or future year only)</small>
              <InputText
                id="yom"
                name="yom"
                value={formData.yom}
                onChange={handleInputChange}
                onBlur={(e) => {
                  const currentYear = new Date().getFullYear();
                  const enteredYear = parseInt(e.target.value);
                  
                  // Validate on blur - ensure it's current or future year
                  if (isNaN(enteredYear) || enteredYear < currentYear) {
                    // Reset to empty if invalid
                    setFormData(prev => ({ ...prev, yom: '' }));
                  }
                }}
                className={`w-full p-2 border ${validationErrors.yom ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder={`${new Date().getFullYear()} or later`}
                keyfilter="int"
                tooltip={`Only current (${new Date().getFullYear()}) or future years are allowed`}
                tooltipOptions={{ position: 'top' }}
              />
              {showValidationErrors && validationErrors.yom && (
                <small className="text-red-500">{validationErrors.yom}</small>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="yor" className="block mb-1 font-medium text-gray-700">
                YOR
              </label>
              <small className="block text-gray-500 mb-1">Year of Refurbishment (Past or current year only)</small>
              <InputText
                id="yor"
                name="yor"
                value={formData.yor}
                onChange={handleInputChange}
                onBlur={(e) => {
                  const currentYear = new Date().getFullYear();
                  const enteredYear = parseInt(e.target.value);
                  
                  // Validate on blur - ensure it's past or current year
                  if (isNaN(enteredYear) || enteredYear > currentYear) {
                    // Reset to empty if invalid
                    setFormData(prev => ({ ...prev, yor: '' }));
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Up to current year"
                keyfilter="int"
                tooltip={`Only past or current year (up to ${new Date().getFullYear()}) is allowed`}
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="seats" className="block mb-1 font-medium text-gray-700">
                Seats*
              </label>
              <small className="block text-gray-500 mb-1">Seating Capacity (Mandatory if Roles Include Charter)</small>
              <InputText
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleInputChange}
                className={`w-full p-2 border ${validationErrors.seats ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="Placeholder"
              />
              {showValidationErrors && validationErrors.seats && (
                <small className="text-red-500">{validationErrors.seats}</small>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <label htmlFor="base" className="block mb-1 text-lg font-medium text-gray-700">
                Base*
              </label>
              <small className="block text-gray-500 mb-2">Used in Quoting based on Pricing Profile</small>
              <div className="relative" ref={baseRef}>
                <div className="flex">
              <InputText
                    value={baseSearch}
                    onChange={(e) => setBaseSearch(e.target.value)}
                    placeholder="Search by ICAO, IATA, Airport Name or Location"
                    className={`w-full p-2 border-2 ${validationErrors.base ? 'border-red-500' : 'border-gray-300'} rounded-l`}
                    onFocus={() => baseSearch.length >= 2 && setIsBaseOpen(true)}
                  />
                  <Button
                    icon="pi pi-chevron-down"
                    className="p-button-primary bg-blue-600 hover:bg-blue-700 rounded-l-none"
                    onClick={() => setIsBaseOpen(!isBaseOpen)}
              />
            </div>
            
                {isBaseOpen && (
                  <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
                    {searchingAirports ? (
                      <div className="p-3 text-center">
                        <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '1rem' }}></i>
                        <div className="mt-1 text-blue-500 text-sm">Searching airports...</div>
                      </div>
                    ) : airports.length > 0 ? (
                      airports.map((airport, index) => {
                        const isSelected = formData.base === airport.icao;
                        return (
                          <div
                            key={index}
                            className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleBaseSelect(airport)}
                          >
                            <div className="font-medium">{airport.airportName} [{airport.icao}]</div>
                            <div className="text-sm text-gray-500">{airport.city}, {airport.country} {airport.iata ? `(${airport.iata})` : ''}</div>
                          </div>
                        );
                      })
                    ) : baseSearch.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">No airports found</div>
                    ) : (
                      <div className="p-3 text-center text-gray-500">Type at least 2 characters to search</div>
                    )}
                  </div>
                )}
              </div>
              {showValidationErrors && validationErrors.base && (
                <small className="text-red-500">{validationErrors.base}</small>
              )}
            </div>

            <div className="mb-8">
              <label htmlFor="currency" className="block mb-1 text-lg font-medium text-gray-700">
                Currency*
              </label>
              <small className="block text-gray-500 mb-2">Select from List</small>
              <div className="relative" ref={currencyRef}>
                <div className="flex">
                  <InputText
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Search currency"
                    className={`w-full p-2 border-2 ${validationErrors.currency ? 'border-red-500' : 'border-gray-300'} rounded-l`}
                    onFocus={() => setIsCurrencyOpen(true)}
                  />
                  <Button
                    icon="pi pi-chevron-down"
                    className="p-button-primary bg-blue-600 hover:bg-blue-700 rounded-l-none"
                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  />
                </div>
                
                {isCurrencyOpen && (
                  <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
                    {loading ? (
                      <div className="p-3 text-center">
                        <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '1rem' }}></i>
                        <div className="mt-1 text-blue-500 text-sm">Loading...</div>
                      </div>
                    ) : filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((currency, index) => {
                        const isSelected = formData.currency === currency.currency_symbole;
                        return (
                          <div
                            key={index}
                            className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <div className="font-medium">{currency.currency_symbole} - {currency.currency_name}</div>
                            <div className="text-sm text-gray-500">Currency</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-gray-500">No currencies found</div>
                    )}
                  </div>
                )}
              </div>
              {showValidationErrors && validationErrors.currency && (
                <small className="text-red-500">{validationErrors.currency}</small>
              )}
            </div>

            <div className="mb-8">
              <label htmlFor="perHour" className="block mb-1 text-lg font-medium text-gray-700">
                Per Hour Rate*
              </label>
              <small className="block text-gray-500 mb-2">Whole number Only</small>
              <InputText
                id="perHour"
                name="perHour"
                value={formData.perHour}
                onChange={handleInputChange}
                className={`w-full p-2 border ${validationErrors.perHour ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="Placeholder"
                type="number"
              />
              {showValidationErrors && validationErrors.perHour && (
                <small className="text-red-500">{validationErrors.perHour}</small>
              )}
            </div>
            
            <div className="mb-8">
              <label htmlFor="taxyTime" className="block mb-1 text-lg font-medium text-gray-700">
                Taxy Time*
              </label>
              <small className="block text-gray-500 mb-2">Enter Duration (Used in Quoting)</small>
              <InputText
                id="taxyTime"
                name="taxyTime"
                value={formData.taxyTime}
                onChange={handleTaxyTimeChange}
                className={`w-full p-2 border ${validationErrors.taxyTime ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="HH:MM"
              />
              {showValidationErrors && validationErrors.taxyTime && (
                <small className="text-red-500">{validationErrors.taxyTime}</small>
              )}
            </div>

            <div className="mb-8">
              <label htmlFor="mtow" className="block mb-1 text-lg font-medium text-gray-700">
                MTOW
              </label>
              <small className="block text-gray-500 mb-2">Maximum Take off Weight (Used in Computing Charges - Roadmap )</small>
              <InputText
                id="mtow"
                name="mtow"
                value={formData.mtow}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Placeholder"
              />
            </div>
            
            <div className="mb-8">
              <label htmlFor="modeS" className="block mb-1 text-lg font-medium text-gray-700">
                Mode S
              </label>
              <small className="block text-gray-500 mb-2">Transponder Mode S Hex Code (Used for determining live location - Roadmap)</small>
              <InputText
                id="modeS"
                name="modeS"
                value={formData.modeS}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Placeholder"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="max-w-2xl mx-auto relative">
            {/* Loading overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="text-center p-4">
                  <i className="pi pi-spin pi-spinner text-blue-500 text-3xl mb-2"></i>
                  <p className="text-blue-700 font-medium">Saving aircraft details...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait, this may take a few seconds</p>
                </div>
              </div>
            )}
            
            {/* API error message */}
            {apiError && !isSubmitting && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <i className="pi pi-exclamation-circle text-red-500 mr-2 mt-0.5"></i>
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-sm text-red-600">
                    {typeof apiError === 'string' ? apiError : apiError.message}
                  </p>
                  
                  {/* Add detailed error information if available */}
                  {typeof apiError === 'object' && apiError.details && (
                    <div className="mt-2 text-xs text-red-600">
                      {apiError.details.missing && apiError.details.missing.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Missing fields: </span>
                          {apiError.details.missing.join(', ')}
                        </div>
                      )}
                      {apiError.details.empty && apiError.details.empty.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Empty fields: </span>
                          {apiError.details.empty.join(', ')}
                        </div>
                      )}
                      {apiError.details.wrongType && apiError.details.wrongType.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Type errors: </span>
                          {apiError.details.wrongType.join(', ')}
                        </div>
                      )}
                      {apiError.details.zeroValues && apiError.details.zeroValues.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Zero values: </span>
                          {apiError.details.zeroValues.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button 
                    className="text-xs text-blue-600 font-medium mt-1 p-1 hover:bg-blue-50 rounded"
                    onClick={() => setApiError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <label htmlFor="amenities" className="block mb-1 text-lg font-medium text-gray-700">
                Amenities
              </label>
              <small className="block text-gray-500 mb-2">Select all applicable Amenities from the list</small>
              <MultiSelect
                id="amenities"
                value={formData.amenities}
                options={amenities}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    amenities: e.value
                  }));
                }}
                optionLabel="amenities_Name"
                placeholder="Select amenities"
                filter
                display="chip"
                className="w-full"
                panelClassName="shadow-lg"
                loading={amenitiesLoading}
                virtualScrollerOptions={{ itemSize: 43 }}
                showClear
                maxSelectedLabels={3}
                panelStyle={{ maxWidth: '450px' }}
                itemTemplate={(amenity) => (
                  <div className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded">
                    {amenity && amenity.icon_Url && (
                      <img 
                        src={amenity.icon_Url} 
                        alt={amenity.amenities_Name} 
                        className="w-5 h-5 mr-3"
                      />
                    )}
                    <span className="font-medium">{amenity ? amenity.amenities_Name : ''}</span>
                  </div>
                )}
                chipTemplate={(amenity) => (
                  <div className="inline-flex items-center px-2 py-1 m-1 bg-blue-50 text-blue-700 rounded-full">
                    {amenity && amenity.icon_Url && (
                      <img 
                        src={amenity.icon_Url} 
                        alt={amenity.amenities_Name} 
                        className="w-4 h-4 mr-1"
                      />
                    )}
                    <span className="text-sm mr-1">{amenity ? amenity.amenities_Name : ''}</span>
                  </div>
                )}
                removeTokenIcon="pi pi-times-circle"
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <div className="mb-8">
              <label htmlFor="exteriorImage" className="block mb-1 text-lg font-medium text-gray-700">
                Exterior Image*
              </label>
              <small className="block text-gray-500 mb-2">Upload a Single Image</small>
              
              <div className="flex">
                <div className="flex-1">
                  <div className={`border border-dashed ${validationErrors.exteriorImage ? 'border-red-500' : 'border-gray-300'} rounded p-0 relative`} style={{ height: '100px' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="pi pi-image text-gray-400 text-xl mb-1"></i>
                        <div className="text-sm text-gray-500">
                          Upload designs by drag and drop or{' '}
                          <span className="text-blue-500 cursor-pointer" onClick={() => exteriorFileUploadRef.current && exteriorFileUploadRef.current.getInput().click()}>
                            click to upload
                          </span>.
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Recommended: JPG/PNG, 1-2MB max for faster uploads
                        </div>
                      </div>
                    </div>
                    <FileUpload
                      ref={exteriorFileUploadRef}
                      name="exteriorImage"
                      url="https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/UploadFile?folderName=FleetImages&tier=cool"
                      accept="image/*"
                      maxFileSize={10000000}
                      customUpload={true}
                      uploadHandler={handleExteriorImageUpload}
                      auto={true}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              
              {showValidationErrors && validationErrors.exteriorImage && (
                <small className="text-red-500">{validationErrors.exteriorImage}</small>
              )}
              
              {uploading && formData.exteriorImage === '' && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                  <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '0.75rem' }}></i>
                  <div className="flex-grow">
                    <span className="text-xs text-blue-700 font-medium">Uploading image ({uploadProgress}%)</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5">Please wait - large files may take longer to process</span>
                  </div>
                  <button 
                    className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => {
                      setUploading(false);
                      if (exteriorFileUploadRef.current) {
                        exteriorFileUploadRef.current.clear();
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {formData.exteriorImage && (
                <div className="flex items-center mt-2">
                  <img 
                    src={formData.exteriorImage} 
                    alt="Exterior" 
                    className="w-16 h-16 object-cover mr-2 cursor-pointer"
                    onClick={() => handleImagePreview(formData.exteriorImage)}
                  />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600 truncate">
                      {formData.exteriorImage.split('/').pop()}
                    </p>
                  </div>
                  <Button 
                    icon="pi pi-times" 
                    className="p-button-rounded p-button-danger p-button-text p-button-sm" 
                    onClick={handleDeleteExteriorImage}
                  />
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <label htmlFor="otherImages" className="block mb-1 text-lg font-medium text-gray-700">
                Other Images
              </label>
              <small className="block text-gray-500 mb-2">Upload Multiple Images (Maximum 4)</small>
              
              <div className="flex">
                <div className="flex-1">
                  <div className="border border-dashed border-gray-300 rounded p-0 relative" style={{ height: '100px' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="pi pi-images text-gray-400 text-xl mb-1"></i>
                        <div className="text-sm text-gray-500">
                          Upload designs by drag and drop or{' '}
                          <span className="text-blue-500 cursor-pointer" onClick={() => otherImagesFileUploadRef.current && otherImagesFileUploadRef.current.getInput().click()}>
                            click to upload
                          </span>.
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Recommended: JPG/PNG, 1-2MB max per image for faster uploads
                        </div>
                      </div>
                    </div>
                    <FileUpload
                      ref={otherImagesFileUploadRef}
                      name="otherImages"
                      url="https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/UploadFile?folderName=FleetImages&tier=cool"
                      accept="image/*"
                      multiple={true}
                      maxFileSize={10000000}
                      customUpload={true}
                      uploadHandler={handleOtherImagesUpload}
                      auto={true}
                      disabled={formData.otherImages && formData.otherImages.length >= 4}
                      className="hidden"
                      chooseLabel="Select Images"
                      emptyTemplate={
                        <div className="flex flex-col items-center justify-center">
                          <i className="pi pi-images text-gray-400 text-xl mb-1"></i>
                          <p className="text-sm text-gray-500">
                            Drag and drop images here or click to select
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Maximum 4 images total ({formData.otherImages ? 4 - formData.otherImages.length : 4} remaining)
                          </p>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
              
              {uploading && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                  <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '0.75rem' }}></i>
                  <div className="flex-grow">
                    <span className="text-xs text-blue-700 font-medium">
                      {currentFileUpload.total > 1 
                        ? `Uploading file ${currentFileUpload.current}/${currentFileUpload.total} (${uploadProgress}%)` 
                        : `Uploading image (${uploadProgress}%)`}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5">Please wait - large files may take longer to process</span>
                  </div>
                  <button 
                    className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => {
                      setUploading(false);
                      if (otherImagesFileUploadRef.current) {
                        otherImagesFileUploadRef.current.clear();
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {formData.otherImages && formData.otherImages.length > 0 && (
                <div className="mt-2" key={`images-container-${imagesUpdateCounter}`}>
                  {console.log("Rendering otherImages:", formData.otherImages, "Counter:", imagesUpdateCounter)}
                  {formData.otherImages.map((imageUrl, index) => {
                    console.log(`Rendering image ${index}:`, imageUrl);
                    return (
                      <div key={`image-${index}-${imagesUpdateCounter}`} className="flex items-center mt-2">
                      <img 
                        src={imageUrl} 
                        alt={`Other ${index + 1}`} 
                        className="w-16 h-16 object-cover mr-2 cursor-pointer"
                        onClick={() => handleImagePreview(imageUrl)}
                          onError={(e) => console.error(`Error loading image ${index}:`, imageUrl)}
                      />
                      <div className="flex-grow">
                        <p className="text-sm text-gray-600 truncate">
                          {imageUrl.split('/').pop()}
                        </p>
                      </div>
                      <Button 
                        icon="pi pi-times" 
                        className="p-button-rounded p-button-danger p-button-text p-button-sm" 
                        onClick={() => handleDeleteOtherImage(imageUrl)}
                      />
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Image Preview Dialog */}
            <Dialog 
              visible={showImagePreview} 
              onHide={() => setShowImagePreview(false)}
              header="Image Preview"
              style={{ width: '90vw', maxWidth: '800px' }}
              breakpoints={{'960px': '75vw', '640px': '90vw'}}
              dismissableMask={true}
              modal={true}
            >
              {previewImage && (
                <div className="flex justify-center">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </div>
              )}
            </Dialog>
          </div>
        );
        
      case 4:
        return (
          <div className="max-w-2xl mx-auto">
            {/* Show API status message at the top of step 4 */}
            {isSubmitting && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                <i className="pi pi-spin pi-spinner text-blue-500 mr-2"></i>
                <div>
                  <p className="text-blue-700 font-medium">Saving aircraft details...</p>
                  <p className="text-sm text-blue-600">You can start uploading documents while we finish saving your aircraft.</p>
                </div>
              </div>
            )}
            
            {apiError && !isSubmitting && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <i className="pi pi-exclamation-triangle text-yellow-500 mr-2 mt-0.5"></i>
                <div>
                  <p className="text-yellow-700 font-medium">Warning</p>
                  <p className="text-sm text-yellow-600">
                    There was an issue saving your aircraft: {apiError}<br/>
                    You can still upload documents, but they may not be properly linked until the aircraft is saved.
                  </p>
                  <button 
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                    onClick={() => {
                      // Go back to step 3 and try again
                      setApiError(null);
                      setStep(3);
                    }}
                  >
                    Go back and try again
                  </button>
                </div>
              </div>
            )}
            
            {apiSuccess && !isSubmitting && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
                <i className="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                <div>
                  <p className="text-green-700 font-medium">Success!</p>
                  <p className="text-sm text-green-600">
                    Your aircraft has been saved successfully. You can now upload documents.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <label htmlFor="insurance" className="block mb-1 text-lg font-medium text-gray-700">
                Insurance
              </label>
              <small className="block text-gray-500 mb-2">Enter the Insurance Validity Date</small>
              <Calendar
                id="insurance"
                value={formData.insuranceDate}
                onChange={(e) => handleDateSelect(e.value, 'insuranceDate')}
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Select insurance date"
                className="w-full"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="airworthiness" className="block mb-1 text-lg font-medium text-gray-700">
                Airworthiness
              </label>
              <small className="block text-gray-500 mb-2">Enter Airworthiness Date</small>
              <Calendar
                id="airworthiness"
                value={formData.airworthinessDate}
                onChange={(e) => handleDateSelect(e.value, 'airworthinessDate')}
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Select airworthiness date"
                className="w-full"
              />
            </div>

            <div className="mb-8">
              <label className="block mb-1 text-lg font-medium text-gray-700">
                Upload Insurance, AirWorthiness and Certificate of Registration
              </label>
              <small className="block text-gray-500 mb-2">Accepted file types: PDF, JPG, PNG</small>
              
              <div className="flex">
                <div className="flex-1">
                  <div className="border border-dashed border-gray-300 rounded p-3 relative" style={{ height: '100px' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <i className="pi pi-file-pdf text-red-500 mx-1" style={{ fontSize: '1rem' }}></i>
                          <i className="pi pi-image text-blue-500 mx-1" style={{ fontSize: '1rem' }}></i>
                        </div>
                        <div className="text-sm text-gray-500">
                          Choose file... or{' '}
                          <span className="text-blue-500 cursor-pointer" onClick={() => documentFileUploadRef.current && documentFileUploadRef.current.getInput().click()}>
                            click to upload
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          PDF, JPG, PNG files only (max 10MB)
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Recommended: Use small files (1-3MB) for faster uploads
                        </div>
                        {validationErrors.documentUpload && (
                          <div className="text-xs text-red-500 mt-1">
                            {validationErrors.documentUpload}
                          </div>
                        )}
                      </div>
                    </div>
                    <FileUpload
                      ref={documentFileUploadRef}
                      name="documents"
                      url={`${API_BASE_URL}/api/SinglePoint/UploadFile?folderName=FleetDocuments&tier=cool`}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      maxFileSize={10000000}
                      customUpload={true}
                      uploadHandler={handleDocumentUpload}
                      auto={true}
                      className="hidden"
                      chooseLabel="Select Document"
                      emptyTemplate={<span className="hidden">Choose document</span>}
                    />
                  </div>
                </div>
              </div>
              
              {uploadingDoc && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                  <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '0.75rem' }}></i>
                  <div className="flex-grow">
                    <span className="text-xs text-blue-700 font-medium">
                      {docUploadProgress > 0 
                        ? `Uploading document (${docUploadProgress}%)` 
                        : 'Processing document...'}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${docUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {docUploadProgress === 100 ? 'Saving to server...' : 'Please wait - large files may take longer to process'}
                    </span>
                  </div>
                  <button 
                    className="text-xs text-gray-500 hover:text-red-500 px-1"
                    onClick={() => {
                      if (documentFileUploadRef.current) {
                        documentFileUploadRef.current.clear();
                      }
                      setUploadingDoc(false);
                      setDocUploadProgress(0);
                    }}
                  >
                    <i className="pi pi-times"></i>
                  </button>
                </div>
              )}
              
              {formData.documents && formData.documents.length > 0 && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <div className="p-2 bg-gray-50 border-b font-medium text-sm text-gray-600">Uploaded Documents</div>
                  <div className="p-2">
                    {formData.documents.map((doc, index) => {
                      // Determine document icon and color based on file extension
                      let icon = "pi-file";
                      let iconColor = "text-gray-500";
                      
                      const ext = doc.name ? doc.name.split('.').pop().toLowerCase() : '';
                      if (['pdf'].includes(ext)) {
                        icon = "pi-file-pdf";
                        iconColor = "text-red-500";
                      } else if (['doc', 'docx'].includes(ext)) {
                        icon = "pi-file-word";
                        iconColor = "text-blue-700";
                      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                        icon = "pi-image";
                        iconColor = "text-blue-500";
                      }
                      
                      return (
                        <div key={index} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <i className={`pi ${icon} ${iconColor} mr-3`} style={{ fontSize: '1.5rem' }}></i>
                      <div className="flex-grow overflow-hidden">
                            <p className="text-sm text-gray-700 truncate font-medium">
                              {doc.name || doc.url.split('/').pop()}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 mr-2 bg-gray-100 px-2 py-0.5 rounded">
                                {doc.type || "Document"}
                              </span>
                              {doc.status === 'saved' ? (
                                <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  <i className="pi pi-check-circle mr-1" style={{ fontSize: '0.7rem' }}></i>
                                  Saved to aircraft
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                                  <i className="pi pi-clock mr-1" style={{ fontSize: '0.7rem' }}></i>
                                  Pending save
                                </span>
                              )}
                            </div>
                            {doc.url && (
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                <i className="pi pi-external-link mr-1" style={{ fontSize: '0.7rem' }}></i>
                                View document
                              </a>
                            )}
                      </div>
                      <Button 
                            icon="pi pi-trash" 
                        className="p-button-rounded p-button-danger p-button-text p-button-sm" 
                        onClick={() => handleDeleteDocument(doc.url)}
                            tooltip="Delete document"
                      />
                    </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
                <p className="text-sm text-blue-700">
                  <i className="pi pi-info-circle mr-2"></i>
                  Documents uploaded here will be automatically saved and associated with this aircraft
                </p>
              </div>
              <button 
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center w-full"
                onClick={() => {
                  if (formData.documents && formData.documents.length > 0 && formData.id) {
                    // Find documents that haven't been saved yet
                    const unsavedDocs = formData.documents.filter(doc => !doc.status || doc.status !== 'saved');
                    
                    if (unsavedDocs.length > 0) {
                      console.log(`Found ${unsavedDocs.length} unsaved documents to save in batch`);
                      // Use the new batch document saving function
                      saveAllDocuments(unsavedDocs, formData.id).then(success => {
                        setIsSubmitting(false);
                        if (success) {
                          console.log("Documents saved successfully - closing form");
                          onSave(formData, true); // Close the form after saving
                        } else {
                          console.log("Document saving encountered an error");
                          // Still close the form, as we've done our best
                          onSave(formData, true);
                        }
                      });
                    } else {
                      // No unsaved documents, just show document upload dialog
                      documentFileUploadRef.current && documentFileUploadRef.current.getInput().click();
                    }
                  } else {
                    documentFileUploadRef.current && documentFileUploadRef.current.getInput().click();
                  }
                }}
                disabled={uploadingDoc}
              >
                <i className="pi pi-upload mr-2 text-lg"></i>
                <span className="font-medium">
                  {uploadingDoc ? "Processing..." : "Upload"}
                </span>
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Handle role conflict confirmation
  const handleRoleConflictConfirm = () => {
    if (!conflictRole) return;
    
    // Get current roles
    let updatedRoles = [...formData.roles];
    
    // Remove the conflicting role (either Medical or Cargo)
    updatedRoles = updatedRoles.filter(r => r.text !== roleToReplace);
    
    // Add the new role
    updatedRoles.push(conflictRole);
    
    // Update form data
    setFormData(prev => ({ 
      ...prev, 
      roles: updatedRoles
    }));
    
    // Close the dialog
    setShowRoleConflictDialog(false);
    setConflictRole(null);
    setRoleToReplace('');
  };
  
  // Handle role conflict cancel
  const handleRoleConflictCancel = () => {
    setShowRoleConflictDialog(false);
    setConflictRole(null);
    setRoleToReplace('');
  };

  // Add useEffect to watch for tailId changes and save pending documents
  useEffect(() => {
    // If we have a tail ID and we're on step 4, save any unsaved documents
    if (formData.id && step === 4) {
      console.log('Tail ID available, saving any pending documents');
      
      // Find documents that haven't been saved yet
      const unsavedDocs = Array.isArray(formData.documents) ? 
        formData.documents.filter(doc => doc.status !== 'saved') : 
        [];
      
      if (unsavedDocs.length > 0) {
        unsavedDocs.forEach(doc => {
          saveDocumentToAPI(doc.type || "document", doc.url, formData.id);
        });
      }
    }
  }, [formData.id, step]);

  // Add debugging useEffect for documents
  useEffect(() => {
    if (formData.documents) {
      console.log('Documents array updated:', formData.documents);
    }
  }, [formData.documents]);

  // Add a function to fetch airport details by ICAO code
  const fetchAirportDetails = async (icaoCode) => {
    if (!icaoCode) return null;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/Markets/GetAirportByICAO?icao=${icaoCode}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      if (response.data && response.data.success && response.data.data) {
        console.log('Fetched airport details:', response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching airport details:', error);
        return null;
    }
  };
  
  // Handle calendar date selection
  const handleDateSelect = (date, field) => {
    console.log(`Setting ${field} to:`, date);
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{mode === 'add' ? 'Add Tail' : 'Edit Tail'}</h2>
      </div>
      
      {renderStepIndicator()}
      
      <div className="flex-grow overflow-y-auto">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <Button 
          label="Cancel" 
          className="p-button-text text-gray-600" 
          onClick={onCancel} 
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          {step > 1 && (
            <Button 
              label="Back" 
              className="p-button-outlined" 
              onClick={prevStep} 
              disabled={isSubmitting}
            />
          )}
          {step < 4 ? (
            <Button 
              label={isSubmitting ? "Saving..." : "Next"} 
              className="p-button-primary bg-blue-600 hover:bg-blue-700" 
              onClick={nextStep} 
              disabled={isSubmitting}
              icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
              iconPos="right"
            />
          ) : (
            <Button 
              label={isSubmitting ? "Saving..." : "Save"} 
              className="p-button-primary bg-blue-600 hover:bg-blue-700" 
              onClick={() => {
                // In step 4, ONLY save documents - DO NOT update tail data
                console.log(`=== SAVE DOCUMENTS BUTTON CLICKED ===`);
                
                if (formData.id) {
                  console.log(`Using tail ID: ${formData.id} to save documents`);
                  console.log('Current documents:', formData.documents);
                  
                  // Set loading state
                    setIsSubmitting(true);
                    
                  // Only save unsaved documents using AddConversationFiles API
                  if (Array.isArray(formData.documents)) {
                    const unsavedDocs = formData.documents.filter(doc => !doc.status || doc.status !== 'saved');
                    
                    console.log('All documents:', formData.documents);
                    console.log('Unsaved documents:', unsavedDocs);
                    
                    if (unsavedDocs.length > 0) {
                      console.log(`Found ${unsavedDocs.length} unsaved documents to save:`, unsavedDocs);
                      
                      // Use the new batch document saving function instead of sequential saving
                      saveAllDocuments(unsavedDocs, formData.id).then(success => {
                        setIsSubmitting(false);
                        if (success) {
                          console.log("Documents saved successfully - closing form");
                          onSave(formData, true); // Close the form after saving
                        } else {
                          console.log("Document saving encountered an error");
                          // Still close the form, as we've done our best
                          onSave(formData, true);
                        }
                      });
                  } else {
                      // No documents to save, just close the form
                      console.log("No unsaved documents found - closing form");
                      setIsSubmitting(false);
                      onSave(formData, true);
                  }
                } else {
                    // No documents array, just close the form
                    console.log("No documents array found - closing form");
                    setIsSubmitting(false);
                    onSave(formData, true);
                  }
                } else {
                  // No tail ID, just close the form
                  console.log("No tail ID found - closing form");
                  onSave(formData, true);
                }
              }}
              disabled={isSubmitting}
              icon="pi pi-save"
            />
          )}
        </div>
      </div>
      
      {/* Role Conflict Dialog */}
      <Dialog
        visible={showRoleConflictDialog}
        onHide={handleRoleConflictCancel}
        header="Role Selection Conflict"
        style={{ width: '450px' }}
        modal
        footer={
          <div className="flex justify-end">
            <Button 
              label="Cancel" 
              className="p-button-text" 
              onClick={handleRoleConflictCancel} 
            />
            <Button 
              label="Confirm" 
              className="p-button-primary" 
              onClick={handleRoleConflictConfirm} 
            />
          </div>
        }
      >
        <div className="flex items-center p-4">
          <i className="pi pi-exclamation-triangle text-yellow-500 text-2xl mr-4"></i>
          <div>
            <p className="text-gray-700">
              <strong>{roleToReplace}</strong> and <strong>{conflictRole?.text}</strong> cannot be selected together. 
              Do you want to replace <strong>{roleToReplace}</strong> with <strong>{conflictRole?.text}</strong>?
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FleetForm; 