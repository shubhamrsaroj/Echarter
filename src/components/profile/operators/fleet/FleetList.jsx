import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Carousel } from 'primereact/carousel';
import { TabView, TabPanel } from 'primereact/tabview';
import axios from 'axios';
import { tokenHandler } from '../../../../utils/tokenHandler';

// API base URL and auth headers
const API_BASE_URL = 'https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net';
const API_KEY = 'instacharter@2025';

// Create a custom axios instance for fleet requests with longer timeouts
const fleetAxios = axios.create({
  timeout: 60000, // 60 seconds timeout
});

// Add request interceptor for logging
fleetAxios.interceptors.request.use(
  config => {
    console.log(`[Fleet API Request] ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for better error handling
fleetAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Fleet API request timeout exceeded:', error.config?.url);
      error.message = 'Request timed out. The server is taking too long to respond.';
    } else if (error.name === 'CanceledError') {
      console.log('Fleet API request canceled:', error.config?.url || 'unknown URL');
    } else if (!error.response) {
      console.error('Fleet API network error:', error.message);
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.status >= 500) {
      console.error('Fleet API server error:', error.response.status, error.config?.url);
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

const getAuthHeaders = () => {
  // Always get the latest token from tokenHandler to ensure we have the most current one
  const token = tokenHandler.getToken();
  
  if (!token) {
    console.warn('No auth token available when creating headers');
  } else {
    console.log('Using token for API request (first 20 chars):', token.substring(0, 20) + '...');
  }
  
  return {
    'accept': 'text/plain',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json'
  };
};

// API functions moved outside component
const fetchCurrencies = async () => {
  try {
    const response = await fleetAxios.get(
      `${API_BASE_URL}/api/Markets/GetAllCurrencyInfo`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data.map(c => ({
        label: `${c.currency_symbole} - ${c.currency_name}`,
        value: c.currency_symbole
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
};

const fetchAircraftTypes = async () => {
  try {
    const response = await fleetAxios.get(
      `${API_BASE_URL}/api/SinglePoint/GetAllAircraftTypesDetails`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data.map(t => ({
        label: t.name,
        value: t.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching aircraft types:', error);
    return [];
  }
};

const searchAirports = async (query) => {
  if (query.length < 2) return [];
  
  try {
    const response = await fleetAxios.get(
      `${API_BASE_URL}/api/Markets/SearchAirportByITA_ICO_NAME_LOCATION?globalInput=${query}`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (response.data && response.data.success) {
      // Map the API response to our format
      return response.data.data.map(a => ({
        label: `${a.icao} - ${a.airportName}`,
        value: a.icao,
        // Use lat/long fields from API response
        lat: a.lat,
        long: a.long,
        // Keep the original data for reference
        originalData: a
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching airports:', error);
    return [];
  }
};

// Fetch airport details by ICAO code
const fetchAirportByIcao = async (icaoCode) => {
  if (!icaoCode || icaoCode.length < 3) return null;
  
  try {
    const response = await fleetAxios.get(
      `${API_BASE_URL}/api/Markets/SearchAirportByITA_ICO_NAME_LOCATION?globalInput=${icaoCode}`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (response.data && response.data.success && response.data.data.length > 0) {
      // Find exact match by ICAO
      const airport = response.data.data.find(a => a.icao === icaoCode);
      if (airport) {
        return {
          icao: airport.icao,
          name: airport.airportName,
          // Use lat/long fields from API response
          lat: airport.lat,
          long: airport.long
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching airport details:', error);
    return null;
  }
};

// Define editor components outside the main component
const TextEditor = memo((props) => {
  const { value, editorCallback } = props.options;
  
  return (
    <InputText
      value={value}
      onChange={(e) => editorCallback(e.target.value)}
      className="w-full p-1"
    />
  );
});

const CurrencyEditor = memo((props) => {
  const { value, editorCallback } = props.options;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      const result = await fetchCurrencies();
      setOptions(result);
      setLoading(false);
    };
    loadOptions();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const filteredOptions = search.length > 0
    ? options.filter(option => 
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;
  
  const handleSelect = (option) => {
    editorCallback(option.value);
    setIsOpen(false);
  };
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search currency"
          className="w-full p-1 border-2 border-gray-300 rounded-l"
          onFocus={() => setIsOpen(true)}
        />
        <Button
          icon="pi pi-chevron-down"
          className="p-button-primary bg-blue-600 hover:bg-blue-700 rounded-l-none p-1"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
          {loading ? (
            <div className="p-3 text-center">
              <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '1rem' }}></i>
              <div className="mt-1 text-blue-500 text-sm">Loading...</div>
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium">{option.label}</div>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center text-gray-500">No currencies found</div>
          )}
        </div>
      )}
    </div>
  );
});

const LocationEditor = memo((props) => {
  const { value, editorCallback } = props.options;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState(value || '');
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const loadOptions = async () => {
      if (search.length >= 2) {
        setLoading(true);
        const result = await searchAirports(search);
        setOptions(result);
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(loadOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSelect = async (option) => {
    // Store the airport details with coordinates in the parent component
    const airportDetails = {
      icao: option.value,
      baseLat: option.lat || 0,
      baselong: option.long || 0,
      originalData: option.originalData
    };
    
    console.log('Selected airport with coordinates:', option);
    console.log('Passing airport details to parent:', airportDetails);
    
    // Call the editor callback with the airport details object
    editorCallback(airportDetails);
    
    setSearch(option.value); // Set search to the selected ICAO code
    setIsOpen(false);
  };
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ICAO, IATA, Airport Name or Location"
          className="w-full p-1 border-2 border-gray-300 rounded-l"
          onFocus={() => setIsOpen(true)}
        />
        <Button
          icon="pi pi-chevron-down"
          className="p-button-primary bg-blue-600 hover:bg-blue-700 rounded-l-none p-1"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
          {loading ? (
            <div className="p-3 text-center">
              <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '1rem' }}></i>
              <div className="mt-1 text-blue-500 text-sm">Searching airports...</div>
            </div>
          ) : options.length > 0 ? (
            options.map((option, index) => {
              const isSelected = value === option.value;
              // Parse the label to extract airport name and location
              const parts = option.label.split(' - ');
              const icao = parts[0];
              const airportName = parts.length > 1 ? parts[1] : '';
              
              return (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium">{icao}</div>
                  <div className="text-sm text-gray-500">{airportName}</div>
                  {option.lat && option.long ? (
                    <div className="text-xs text-gray-400">
                      Lat: {option.lat.toFixed(4)}, Long: {option.long.toFixed(4)}
                    </div>
                  ) : (
                    <div className="text-xs text-red-400">
                      Missing coordinates - select a different airport
                    </div>
                  )}
                </div>
              );
            })
          ) : search.length >= 2 ? (
            <div className="p-3 text-center text-gray-500">No airports found</div>
          ) : (
            <div className="p-3 text-center text-gray-500">Type at least 2 characters to search</div>
          )}
        </div>
      )}
    </div>
  );
});

const FleetList = ({ 
  onAddFleet, 
  onEditFleet, 
  onViewFleet, 
  onDeleteFleet,
  frequentlyEdited = {},
  refreshTrigger = 0
}) => {
  // Get company ID from token right at component initialization
  const [companyId, setCompanyId] = useState(() => {
    console.log('===== FLEET LIST COMPONENT INITIALIZING =====');
    // Try to get company ID from token first
    const token = tokenHandler.getToken();
    console.log('Auth token available:', !!token);
    
    let userCompanyId = 1921; // Default to InstaCharter company ID
    
    if (token) {
      try {
        const userData = tokenHandler.parseUserFromToken(token);
        console.log('User data from token:', userData);
        if (userData?.comId) {
          console.log('Using company ID from token:', userData.comId);
          userCompanyId = userData.comId;
        }
      } catch (error) {
        console.error('Error parsing user data from token:', error);
      }
    } else {
      console.warn('No auth token available, will use default company ID');
    }
    
    return userCompanyId;
  });

  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const toastRef = useRef(null);
  // Track unsaved changes by row ID
  const [unsavedChanges, setUnsavedChanges] = useState({});
  // Store temporary edits
  const [tempEdits, setTempEdits] = useState({});
  // Add state to track data loading attempts and prevent infinite loop
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  
  // Add state for delete confirmation dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Add state for update trigger
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Helper function to convert taxy time from HH:MM to decimal
  const convertTaxyTimeToDecimal = useCallback((timeStr) => {
    if (!timeStr) return 0;
    // Convert timeStr to string to ensure includes() works properly
    const timeString = String(timeStr);
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours + (minutes / 60);
    }
    return parseFloat(timeStr) || 0;
  }, []);
  
  // Store edits temporarily without saving to API
  const handleCellEditChange = useCallback((e) => {
    const { rowData, newValue, field } = e;
    
    // Don't update if value hasn't changed
    if (rowData[field] === newValue) return;
    
    console.log('Cell edit detected:', rowData.id, field, newValue);
    
    // Special handling for location field to store coordinates
    if (field === 'location' && typeof newValue === 'object' && newValue.icao) {
      console.log('Airport object detected with coordinates:', newValue);
      
      // Update the fleet item in the UI with just the ICAO code
      setFleet(prevFleet => 
        prevFleet.map(item => 
          item.id === rowData.id ? { ...item, [field]: newValue.icao } : item
        )
      );
      
      // Store the full object with coordinates in tempEdits
      const newTempEdits = {
        ...tempEdits,
        [rowData.id]: {
          ...(tempEdits[rowData.id] || {}),
          [field]: newValue.icao,
          baseLat: newValue.baseLat || 0,
          baselong: newValue.baselong || 0
        }
      };
      setTempEdits(newTempEdits);
      console.log('Updated tempEdits with location and coordinates:', newTempEdits);
    } 
    // Special handling for registration field to ensure it's properly updated
    else if (field === 'registration') {
      console.log('Registration edit detected:', newValue);
      
      // Update the fleet item in the UI
      setFleet(prevFleet => 
        prevFleet.map(item => 
          item.id === rowData.id ? { ...item, [field]: newValue } : item
        )
      );
      
      // Store the edit in tempEdits and explicitly map to both slNo and tail fields
      const newTempEdits = {
        ...tempEdits,
        [rowData.id]: {
          ...(tempEdits[rowData.id] || {}),
          [field]: newValue,
          slNo: newValue, // Map to slNo field for API
          tail: newValue  // Map to tail field for API (where registration actually is)
        }
      };
      setTempEdits(newTempEdits);
      console.log('Updated tempEdits with registration:', newTempEdits);
    }
    else {
      // Normal handling for other fields
      // Update the fleet item in the UI immediately (but not in the API)
      setFleet(prevFleet => 
        prevFleet.map(item => 
          item.id === rowData.id ? { ...item, [field]: newValue } : item
        )
      );
      
      // Store the edit in tempEdits
      const newTempEdits = {
        ...tempEdits,
        [rowData.id]: {
          ...(tempEdits[rowData.id] || {}),
          [field]: newValue
        }
      };
      setTempEdits(newTempEdits);
      console.log('Updated tempEdits:', newTempEdits);
    }
    
    // Mark this row as having unsaved changes - use direct state update
    const newUnsavedChanges = {
      ...unsavedChanges,
      [rowData.id]: true
    };
    setUnsavedChanges(newUnsavedChanges);
    console.log('Updated unsavedChanges:', newUnsavedChanges);
  }, [tempEdits, unsavedChanges, setFleet]);
  
  // Save changes for a specific row
  const saveRowChanges = useCallback(async (rowId) => {
    // If no unsaved changes for this row, do nothing
    if (!unsavedChanges[rowId] || !tempEdits[rowId]) return;
    
    try {
      setLoading(true);
      
      // Get the row data
      const rowData = fleet.find(item => item.id === rowId);
      if (!rowData) {
        throw new Error('Row data not found');
      }
      
      console.log('Original row data:', rowData);
      console.log('Temp edits to apply:', tempEdits[rowId]);
      
      // Create a minimal payload with all required fields
      const minimalPayload = {
        id: rowId,
        comId: companyId,
        model: rowData.type || '', // Required field
        aircraftTypeName: rowData.type || '', // Required field
        isActive: true, // Required field
        slNo: rowData.registration || '', // Registration/tail number
        tail: rowData.registration || '', // Also set the tail field since that's where registration is stored
        base: rowData.location || '', // Base location
        perHr: parseInt(rowData.perHour) || 0, // Per hour rate
        taxyTime: convertTaxyTimeToDecimal(rowData.taxyTime) || 0, // Taxy time
        currency: rowData.currency || 'USD', // Currency
        blocked: rowData.na || false // NA status
      };
      
      // Add only the changed fields from tempEdits
      for (const key in tempEdits[rowId]) {
        // Special handling for coordinates
        if (key === 'baseLat' || key === 'baselong') {
          minimalPayload[key] = tempEdits[rowId][key];
        }
        // Handle location field
        else if (key === 'location') {
          minimalPayload.base = tempEdits[rowId][key];
        }
        // Handle type field - update both model and aircraftTypeName
        else if (key === 'type') {
          minimalPayload.model = tempEdits[rowId][key];
          minimalPayload.aircraftTypeName = tempEdits[rowId][key];
        }
        // Handle perHour field
        else if (key === 'perHour') {
          minimalPayload.perHr = parseInt(tempEdits[rowId][key]) || 0;
        }
        // Handle NA field
        else if (key === 'na') {
          minimalPayload.blocked = tempEdits[rowId][key];
        }
        // Handle taxyTime field - convert to decimal if needed
        else if (key === 'taxyTime') {
          minimalPayload.taxyTime = convertTaxyTimeToDecimal(tempEdits[rowId][key]) || 0;
        }
        // Handle registration field - map to slNo
        else if (key === 'registration') {
          minimalPayload.slNo = tempEdits[rowId][key];
          minimalPayload.tail = tempEdits[rowId][key]; // Also update tail field
        }
        // Handle other fields directly
        else {
          minimalPayload[key] = tempEdits[rowId][key];
        }
      }
      
      console.log('Minimal API Payload for update:', minimalPayload);
      
      // Try multiple approaches to ensure the request succeeds
      let response;
      let success = false;
      
      // First attempt: Use the dynamic token with company ID in URL and body
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/SinglePoint/UpdateTail?comId=${companyId}&id=${rowId}`,
          minimalPayload,
          {
            headers: getAuthHeaders(),
            timeout: 60000 // 60 second timeout
          }
        ).catch(error => {
          console.log('Error response data:', error.response?.data);
          throw error;
        });
        
        if (response.data && response.data.success) {
          success = true;
        } else {
          console.log('First attempt failed, trying alternative approach');
        }
      } catch (error) {
        console.log('First API attempt error:', error.message);
      }
      
      // If first attempt failed, try a different approach
      if (!success) {
        try {
          // Add company ID to the URL as a query parameter
          const url = new URL(`${API_BASE_URL}/api/SinglePoint/UpdateTail`);
          url.searchParams.append('comId', companyId);
          url.searchParams.append('id', rowId);
          
          response = await axios({
            method: 'POST',
            url: url.toString(),
            data: minimalPayload,
            headers: getAuthHeaders(),
            timeout: 60000 // 60 second timeout
          }).catch(error => {
            console.log('Error response data:', error.response?.data);
            throw error;
          });
          
          if (response.data && response.data.success) {
            success = true;
          }
        } catch (error) {
          console.log('Second API attempt error:', error.message);
          throw error; // If both attempts fail, throw the error
        }
      }
      
      console.log('API Response:', response);
      
      // Check if the response is successful
      if (success) {
        // Update the local state with all the changes
        setFleet(prevFleet => 
          prevFleet.map(item => 
            item.id === rowId ? { ...item, ...tempEdits[rowId] } : item
          )
        );
        
        // Clear unsaved changes and temp edits for this row
        setUnsavedChanges(prev => {
          const newUnsavedChanges = { ...prev };
          delete newUnsavedChanges[rowId];
          return newUnsavedChanges;
        });
        
        setTempEdits(prev => {
          const newTempEdits = { ...prev };
          delete newTempEdits[rowId];
          return newTempEdits;
        });
        
        toastRef.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Fleet item updated successfully' 
        });
      } else {
        console.error('API returned error:', response?.data?.message || 'Unknown error');
        throw new Error(response?.data?.message || 'Failed to update fleet item');
      }
    } catch (error) {
      console.error(`Error saving changes:`, error);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Failed to save changes: ` + (error.message || 'Unknown error') 
      });
    } finally {
      setLoading(false);
    }
  }, [fleet, unsavedChanges, tempEdits, convertTaxyTimeToDecimal, companyId]);
  
  // Define fetchCompanyData using useCallback to avoid infinite loops
  const fetchCompanyData = useCallback(async () => {
    // Create a new AbortController for each request
    const controller = new AbortController();
    
    try {
      setLoading(true);
      // Increment load attempts counter
      setLoadAttempts(prev => prev + 1);
      
      console.log(`Fetching company data - attempt ${loadAttempts + 1} for ID: ${companyId}`);
      
      // Set a much longer timeout for the API call - 60 seconds instead of 30
      const timeoutId = setTimeout(() => {
        console.log('API request timeout reached after 60 seconds, aborting');
        controller.abort();
      }, 60000); // 60 second timeout
      
      const response = await fleetAxios.get(
        `${API_BASE_URL}/api/SinglePoint/GetCompaniesById?Id=${companyId}`,
        {
          headers: getAuthHeaders(),
          signal: controller.signal
          // No need to specify timeout here as it's set in the fleetAxios instance
        }
      );
      
      // Clear the timeout since request completed successfully
      clearTimeout(timeoutId);
      
      console.log("API Response status:", response.status);
      
      if (response.data && response.data.success) {
        console.log("Company Data received successfully");
        
        setCompanyData(response.data.data);
        
        // If company ID is available in response, update our state
        if (response.data.data?.id) {
          setCompanyId(response.data.data.id);
        }
        
        // Check for tailInfo in the response
        if (response.data.data.tailInfo && Array.isArray(response.data.data.tailInfo)) {
          console.log(`Found ${response.data.data.tailInfo.length} aircraft in tailInfo`);
          
          // Debug log for first aircraft
          if (response.data.data.tailInfo.length > 0) {
            const firstAircraft = response.data.data.tailInfo[0];
            
            // Special log when registration is in tail field but not in other fields
            if (firstAircraft.tail && !(firstAircraft.slNo || firstAircraft.registration)) {
              console.log('REGISTRATION FOUND IN TAIL FIELD:', firstAircraft.tail);
              console.log('TAIL FIELD REGISTRATION DATA STRUCTURE:', firstAircraft);
            }
            
            console.log('First aircraft field data:', {
              id: firstAircraft.id,
              slNo: firstAircraft.slNo,
              sl_No: firstAircraft.sl_No,
              tail: firstAircraft.tail,
              registration: firstAircraft.registration,
              tailNumber: firstAircraft.tailNumber,
              allKeys: Object.keys(firstAircraft)
            });
          }
          
          const fleetData = response.data.data.tailInfo.map(tail => {
            // Extract registration from any field that might contain it
            // Prioritize the tail field specifically since that contains the registration
            const registration = tail.tail || tail.slNo || tail.sl_No || tail.registration || tail.tailNumber || '';
            
            // Log if registration is empty
            if (!registration) {
              console.warn('Missing registration for aircraft ID:', tail.id);
            }
            
            return {
              id: tail.id || Date.now(),
              registration: registration,
              originalRegistration: {
                slNo: tail.slNo,
                sl_No: tail.sl_No,
                tail: tail.tail,
                registration: tail.registration,
                tailNumber: tail.tailNumber
              },
              type: tail.aircraft_Type_Name || tail.aircraftTypeName || '',
              location: tail.base || '',
              currency: tail.currency || 'USD',
              perHour: tail.rate || tail.perHr || '',
              taxyTime: tail.taxyTime || tail.taxy_Time || '00:00',
              na: tail.blocked || tail.block || false,
              originalData: tail
            };
          });
          
          setFleet(fleetData);
          setDataLoaded(true);
          
          // Set empty state if no data was found
          if (fleetData.length === 0) {
            setEmptyState(true);
          }
        } 
        // Check for alternative property names
        else if (response.data.data.fleet && Array.isArray(response.data.data.fleet)) {
          console.log(`Found ${response.data.data.fleet.length} aircraft in fleet`);
          
          // Debug log for first aircraft in fleet array
          if (response.data.data.fleet.length > 0) {
            const firstAircraft = response.data.data.fleet[0];
            
            // Special log when registration is in tail field but not in other fields
            if (firstAircraft.tail && !(firstAircraft.slNo || firstAircraft.registration)) {
              console.log('REGISTRATION FOUND IN TAIL FIELD (fleet array):', firstAircraft.tail);
              console.log('TAIL FIELD REGISTRATION DATA STRUCTURE (fleet array):', firstAircraft);
            }
            
            console.log('First aircraft in fleet array:', {
              id: firstAircraft.id,
              slNo: firstAircraft.slNo,
              sl_No: firstAircraft.sl_No,
              tail: firstAircraft.tail,
              registration: firstAircraft.registration,
              tailNumber: firstAircraft.tailNumber,
              allKeys: Object.keys(firstAircraft)
            });
          }
          
          const fleetData = response.data.data.fleet.map(tail => {
            // Extract registration from any field that might contain it
            // Prioritize the tail field specifically since that contains the registration
            const registration = tail.tail || tail.slNo || tail.sl_No || tail.registration || tail.tailNumber || '';
            
            // Log if registration is empty
            if (!registration) {
              console.warn('Missing registration for aircraft ID:', tail.id);
            }
            
            return {
              id: tail.id || Date.now(),
              registration: registration,
              originalRegistration: {
                slNo: tail.slNo,
                sl_No: tail.sl_No,
                tail: tail.tail,
                registration: tail.registration,
                tailNumber: tail.tailNumber
              },
              type: tail.aircraft_Type_Name || tail.aircraftType || tail.type || '',
              location: tail.base || tail.baseICAO || tail.location || '',
              currency: tail.currency || 'USD',
              perHour: tail.rate || tail.perHourRate || tail.perHr || tail.perHour || '',
              taxyTime: tail.taxyTime || tail.taxy_Time || '00:00',
              na: tail.blocked || tail.block || tail.na || false,
              originalData: tail
            };
          });
          
          setFleet(fleetData);
          setDataLoaded(true);
          
          if (fleetData.length === 0) {
            setEmptyState(true);
          }
        }
        // No data found in any property
        else {
          console.log("No fleet data found in response");
          
          setFleet([]);
          setDataLoaded(true);
          setEmptyState(true);
          
          toastRef.current?.show({ 
            severity: 'info', 
            summary: 'Fleet Empty', 
            detail: 'You have no aircraft in your fleet yet. Add your first aircraft to get started.' 
          });
        }
      } else {
        console.log("API response indicates failure or missing data");
        
        toastRef.current?.show({ 
          severity: 'info', 
          summary: 'Fleet Empty', 
          detail: 'You have no aircraft in your fleet yet. Add your first aircraft to get started.' 
        });
        
        setFleet([]);
        setDataLoaded(true);
        setEmptyState(true);
      }
    } catch (error) {
      // Clean up timeout if request fails
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.error('API request timed out after 60 seconds');
        toastRef.current?.show({ 
          severity: 'error', 
          summary: 'Connection Timeout', 
          detail: 'Server is taking too long to respond. The network might be slow or the server is busy.' 
        });
      } else if (error.name === 'CanceledError') {
        console.error('Request was canceled:', error.message);
        // Don't show toast for canceled requests - they're usually caused by component unmounting
      } else {
        console.error('Error fetching company data:', error);
        toastRef.current?.show({ 
          severity: 'error', 
          summary: 'Connection Error', 
          detail: 'Unable to fetch fleet data. Please check your network connection and try again.' 
        });
      }
      
      setFleet([]);
      setDataLoaded(true);
      setEmptyState(true);
    } finally {
      setLoading(false);
    }
    
    // Return a cleanup function that aborts the request if component unmounts
    return () => {
      controller.abort();
    };
  }, [companyId, loadAttempts, toastRef, setCompanyId, setFleet, setDataLoaded, setEmptyState, setLoading]);
  
  // DataTable reference
  const dt = useRef(null);
  
  // Handle delete fleet item
  const handleDeleteFleet = useCallback(async (rowData) => {
    try {
      setLoading(true);
      
      // Log the rowData being deleted for debugging
      console.log('Attempting to delete tail with ID:', rowData.id, 'Registration:', rowData.registration);
      
      // Try multiple approaches to ensure the request succeeds
      let response;
      let success = false;
      
      // First attempt: Use only tailId as shown in the example URL
      try {
        const deleteUrl = `${API_BASE_URL}/api/SinglePoint/DeleteTail?tailId=${rowData.id}`;
        console.log('DELETE request URL:', deleteUrl);
        
        response = await fleetAxios.delete(
          deleteUrl,
          {
            headers: getAuthHeaders()
          }
        );
        
        console.log('First attempt response:', response);
        
        if (response.data && response.data.success) {
          success = true;
        } else {
          console.log('First delete attempt failed, trying with company ID');
        }
      } catch (error) {
        console.log('First delete API attempt error:', error.message);
        console.log('Error details:', error.response?.data || 'No response data');
      }
      
      // If first attempt failed, try with company ID
      if (!success) {
        try {
          // Add company ID to the URL as a query parameter
          const url = new URL(`${API_BASE_URL}/api/SinglePoint/DeleteTail`);
          url.searchParams.append('tailId', rowData.id);
          url.searchParams.append('comId', companyId);
          
          console.log('Second attempt DELETE request URL:', url.toString());
          
          response = await fleetAxios({
            method: 'DELETE',
            url: url.toString(),
            headers: getAuthHeaders()
          });
          
          console.log('Second attempt response:', response);
          
          if (response.data && response.data.success) {
            success = true;
          }
        } catch (error) {
          console.log('Second delete API attempt error:', error.message);
          console.log('Error details:', error.response?.data || 'No response data');
          throw error; // If both attempts fail, throw the error
        }
      }
      
      console.log('API Response for delete:', response);
      
      // Check if the response is successful
      if (success) {
        // Update the local state immediately
        setFleet(prevFleet => {
          const updatedFleet = prevFleet.filter(item => item.id !== rowData.id);
          console.log(`Local fleet data updated: ${prevFleet.length} -> ${updatedFleet.length} items`);
          return updatedFleet;
        });
        
        // Also update the dataTable state if needed
        if (dt.current && dt.current.value) {
          console.log('Updating DataTable value directly');
          dt.current.value = dt.current.value.filter(item => item.id !== rowData.id);
          
          // Force a rerender of the DataTable
          if (dt.current.forceUpdate) {
            dt.current.forceUpdate();
          }
        }
        
        // Force a rerender of the component
        setUpdateTrigger(prev => prev + 1);
        
        toastRef.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Fleet item deleted successfully' 
        });
        
        return true; // Indicate success to the caller
      } else {
        const errorMessage = response?.data?.message || 'Unknown error';
        console.error('API returned error:', errorMessage);
        
        // Show more detailed error message to the user
        toastRef.current?.show({ 
          severity: 'error', 
          summary: 'Delete Failed', 
          detail: `Server returned: ${errorMessage}. The tail might not exist or you don't have permission.`,
          life: 5000
        });
        
        throw new Error(errorMessage || 'Failed to delete fleet item');
      }
    } catch (error) {
      console.error('Error deleting fleet item:', error);
      
      // Show more helpful error message
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to delete fleet item: ' + (error.message || 'Unknown error') + 
          '. This may happen if the item was already deleted or doesn\'t exist in the database.',
        life: 5000
      });
      
      return false; // Indicate failure to the caller
    } finally {
      setLoading(false);
    }
  }, [setFleet, setLoading, toastRef, companyId, dt]);
  
  // Handle NA checkbox change
  const handleNaChange = useCallback(async (rowData, checked) => {
    try {
      setLoading(true);
      
      // Create a minimal payload with only the necessary fields
      const minimalPayload = {
        id: rowData.id,
        comId: companyId,
        blocked: checked, // Update NA status
        model: rowData.type || '', // Required field
        aircraftTypeName: rowData.type || '', // Required field
        isActive: true // Required field
      };
      
      console.log('Minimal API Payload for NA update:', minimalPayload);
      
      // Try multiple approaches to ensure the request succeeds
      let response;
      let success = false;
      
      // First attempt: Use the dynamic token with company ID in URL and body
      try {
        response = await fleetAxios.post(
          `${API_BASE_URL}/api/SinglePoint/UpdateTail?comId=${companyId}&id=${rowData.id}`,
          minimalPayload,
          {
            headers: getAuthHeaders()
          }
        ).catch(error => {
          console.log('Error response data:', error.response?.data);
          throw error;
        });
        
        if (response.data && response.data.success) {
          success = true;
        } else {
          console.log('First NA update attempt failed, trying alternative approach');
        }
      } catch (error) {
        console.log('First NA update API attempt error:', error.message);
      }
      
      // If first attempt failed, try a different approach
      if (!success) {
        try {
          // Add company ID to the URL as a query parameter
          const url = new URL(`${API_BASE_URL}/api/SinglePoint/UpdateTail`);
          url.searchParams.append('comId', companyId);
          url.searchParams.append('id', rowData.id);
          
          response = await fleetAxios({
            method: 'POST',
            url: url.toString(),
            data: minimalPayload,
            headers: getAuthHeaders()
          }).catch(error => {
            console.log('Error response data:', error.response?.data);
            throw error;
          });
          
          if (response.data && response.data.success) {
            success = true;
          }
        } catch (error) {
          console.log('Second NA update API attempt error:', error.message);
          throw error; // If both attempts fail, throw the error
        }
      }
      
      console.log('API Response for NA update:', response);
      
      // Check if the response is successful
      if (success) {
        // Update the local state
        setFleet(prevFleet => 
          prevFleet.map(item => 
            item.id === rowData.id ? { ...item, na: checked } : item
          )
        );
        
        toastRef.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'NA status updated successfully' 
        });
      } else {
        console.error('API returned error:', response?.data?.message || 'Unknown error');
        throw new Error(response?.data?.message || 'Failed to update NA status');
      }
    } catch (error) {
      console.error('Error updating NA status:', error);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update NA status: ' + (error.message || 'Unknown error') 
      });
    } finally {
      setLoading(false);
    }
  }, [convertTaxyTimeToDecimal, setFleet, setLoading, toastRef,companyId]);
  
  // NA checkbox template
  const naTemplate = useCallback((rowData) => {
    return (
      <div className="flex justify-center">
        <Checkbox 
          checked={rowData.na} 
          onChange={(e) => handleNaChange(rowData, e.checked)}
        />
      </div>
    );
  }, [handleNaChange]);
  
  // Confirm delete and then proceed
  const confirmDelete = useCallback((rowData) => {
    setItemToDelete(rowData);
    setDeleteDialogVisible(true);
  }, []);
  
  // Execute delete after confirmation
  const executeDelete = useCallback(async () => {
    if (!itemToDelete) return;
    
    // Check if the item has an ID
    if (!itemToDelete.id) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot delete this item - missing ID',
        life: 3000
      });
      setDeleteDialogVisible(false);
      setItemToDelete(null);
      return;
    }
    
    console.log('Executing delete for item:', itemToDelete);
    console.log('Item ID:', itemToDelete.id);
    console.log('Item registration:', itemToDelete.registration);
    console.log('Item originalData:', itemToDelete.originalData);
    
    // First call the internal API function to delete from the server
    const success = await handleDeleteFleet(itemToDelete);
    
    // Only call the parent component's onDeleteFleet function if the API call succeeded
    if (success) {
      // Make sure we're passing the right data format to the parent component
      const itemForParent = {
        ...itemToDelete,
        id: itemToDelete.id // Ensure ID is included
      };
      
      console.log('Delete successful! Updating parent component with:', itemForParent);
      
      // Update the local state immediately to reflect the change in the UI
      setFleet(prevFleet => prevFleet.filter(item => item.id !== itemToDelete.id));
      
      // Notify the parent component
      if (onDeleteFleet) {
        onDeleteFleet(itemForParent);
      }
      
      // Show success message
      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Fleet item deleted successfully',
        life: 3000
      });
    }
    
    // Close the dialog
    setDeleteDialogVisible(false);
    setItemToDelete(null);
  }, [itemToDelete, handleDeleteFleet, onDeleteFleet, toastRef, setFleet]);

  // Action buttons template with save button that changes color when there are unsaved changes
  const actionTemplate = useCallback((rowData) => {
    // Use a direct check of the unsavedChanges state
    const rowHasUnsavedChanges = unsavedChanges.hasOwnProperty(rowData.id) && unsavedChanges[rowData.id] === true;
    
    console.log('Rendering action template for row:', rowData.id, 'hasUnsavedChanges:', rowHasUnsavedChanges);
    
    return (
      <div className="flex items-center justify-end gap-2" key={`actions-${rowData.id}-${rowHasUnsavedChanges}`}>
        <Button
          icon="pi pi-save"
          className={`p-button-rounded p-button-sm ${rowHasUnsavedChanges ? 'p-button-primary' : 'p-button-text'}`}
          onClick={() => {
            console.log('Save button clicked for row:', rowData.id);
            saveRowChanges(rowData.id);
          }}
          disabled={!rowHasUnsavedChanges}
          tooltip={rowHasUnsavedChanges ? "Save changes" : "No changes to save"}
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => {
            // Fetch complete tail details via API before editing
            console.log('Edit button clicked for row:', rowData.id);
            
            // Show loading toast
            toastRef.current?.show({
              severity: 'info',
              summary: 'Loading',
              detail: 'Fetching aircraft details...',
              life: 3000
            });
            
            // Call the API to get complete details
            const apiUrl = `${API_BASE_URL}/api/SinglePoint/GetTailDetailsById?Id=${rowData.id}`;
            console.log('Fetching from URL:', apiUrl);
            
            // Use fleetAxios with timeout handling
            fleetAxios.get(
              apiUrl,
              {
                headers: getAuthHeaders()
              }
            )
            .then(response => {
              if (response.data && response.data.success) {
                console.log('Fetched complete tail details:', response.data.data);
                
                // Create complete fleet item with all details from API
                const tailDetails = response.data.data;
                const completeFleetItem = {
                  ...rowData,
                  id: tailDetails.id,
                  registration: tailDetails.sl_No,
                  tail: tailDetails.sl_No,
                  type: tailDetails.aircraft_Type_Name,
                  aircraft_Type_Name: tailDetails.aircraft_Type_Name,
                  location: tailDetails.base,
                  base: tailDetails.base,
                  currency: tailDetails.currency,
                  perHour: tailDetails.rate,
                  rate: tailDetails.rate,
                  taxyTime: tailDetails.taxy_Time,
                  na: tailDetails.block,
                  blocked: tailDetails.block,
                  yom: tailDetails.yom,
                  yor: tailDetails.yor,
                  seats: tailDetails.tail_Max_Pax,
                  tail_Max_Pax: tailDetails.tail_Max_Pax,
                  mtow: tailDetails.mtoWkg,
                  modeS: tailDetails.mode_S,
                  baseLat: tailDetails.latitude,
                  baseLong: tailDetails.longitude,
                  airworthinessDate: tailDetails.airworthinessValidity ? new Date(tailDetails.airworthinessValidity) : null,
                  insuranceDate: tailDetails.insuranceValidity ? new Date(tailDetails.insuranceValidity) : null,
                  images: tailDetails.images || [],
                  exteriorImage: tailDetails.images && tailDetails.images.length > 0 ? tailDetails.images[0] : '',
                  otherImages: tailDetails.images && tailDetails.images.length > 1 ? tailDetails.images.slice(1) : [],
                  roles: tailDetails.other_Tags 
                    ? tailDetails.other_Tags.split(',').map(tag => ({ text: tag.trim() })) 
                    : [],
                  amenities: tailDetails.amenities || [],
                  documents: [
                    ...(tailDetails.privateFiles || []).map(file => ({ 
                      url: file.url, 
                      name: file.name || file.url.split('/').pop(), 
                      type: file.docType || 'document',
                      status: 'saved'
                    })),
                    ...(tailDetails.publicFiles || []).map(file => ({ 
                      url: file.url, 
                      name: file.name || file.url.split('/').pop(), 
                      type: file.docType || 'document',
                      status: 'saved'
                    }))
                  ],
                  originalApiData: tailDetails
                };
                
                // Call parent's edit function with complete data
                onEditFleet(completeFleetItem);
              } else {
                console.error('Error fetching tail details:', response.data?.message || 'Unknown error');
                toastRef.current?.show({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to fetch aircraft details: ' + (response.data?.message || 'Unknown error'),
                  life: 3000
                });
                
                // Fall back to using existing data
                onEditFleet(rowData.originalData || rowData);
              }
            })
            .catch(error => {
              console.error('Error fetching tail details:', error);
              toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch aircraft details: ' + (error.message || 'Network error'),
                life: 3000
              });
              
              // Fall back to using existing data
              onEditFleet(rowData.originalData || rowData);
            });
          }}
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  }, [unsavedChanges, saveRowChanges, onEditFleet, confirmDelete, toastRef, API_BASE_URL, fleetAxios, getAuthHeaders]);
  
  // Editor component references
  const textEditor = useCallback((options) => <TextEditor options={options} />, []);
  const currencyEditor = useCallback((options) => <CurrencyEditor options={options} />, []);
  const locationEditor = useCallback((options) => <LocationEditor options={options} />, []);

  // Company logo template
  const logoTemplate = useCallback(() => {
    // Return null to remove the logo
    return null;
  }, [companyData]);

  // Registration template to ensure values are always displayed
  const registrationTemplate = useCallback((rowData) => {
    // First check the originalData if it exists
    let registration = '';
    
    if (rowData.originalData && rowData.originalData.tail) {
      // Prioritize the tail field from the original API data
      registration = rowData.originalData.tail;
    } else {
      // Fall back to any available registration field
      registration = rowData.registration || rowData.tail || rowData.slNo || '';
    }
    
    if (!registration) {
      console.warn('No registration found for aircraft ID:', rowData.id);
      return <span className="text-gray-400 italic">No Reg.</span>;
    }
    
    return <span>{registration}</span>;
  }, []);
  
  // Format per hour rate without currency
  const perHourTemplate = useCallback((rowData) => {
    if (!rowData.perHour) return '';
    
    // Format number with thousands separator, but without currency
    const formattedNumber = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(rowData.perHour);
    
    return formattedNumber;
  }, []);
  
  // Handle pagination change
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Use effect to fetch data with retry logic
  useEffect(() => {
    // Skip if already loaded successfully or max attempts reached
    if (dataLoaded || loadAttempts >= 3) {
      return;
    }
    
    // Use much longer delays to avoid timeout issues
    // 1st attempt: 2 seconds, 2nd attempt: 10 seconds, 3rd attempt: 30 seconds
    let backoffDelay = 2000; // Base delay
    if (loadAttempts === 1) {
      backoffDelay = 10000; // 10 seconds for 2nd attempt
    } else if (loadAttempts === 2) {
      backoffDelay = 30000; // 30 seconds for 3rd attempt
    }
    
    console.log(`Setting up data fetch with ${backoffDelay/1000}s delay (attempt ${loadAttempts + 1} of 3)`);
    
    // Add a delay with exponential backoff to prevent rapid requests
    const timer = setTimeout(() => {
      // Only proceed if not already loading
      if (!loading) {
        console.log(`Executing fetch attempt ${loadAttempts + 1} after ${backoffDelay/1000}s delay`);
        const fetchPromise = fetchCompanyData();
        
        // Store the cleanup function
        return () => {
          // Call the cleanup function returned by fetchCompanyData
          if (typeof fetchPromise.then === 'function') {
            fetchPromise.then(cleanup => {
              if (typeof cleanup === 'function') {
                cleanup();
              }
            });
          }
        };
      }
    }, backoffDelay);
    
    return () => {
      console.log(`Cleaning up timer for attempt ${loadAttempts + 1}`);
      clearTimeout(timer);
    };
  }, [companyId, dataLoaded, loadAttempts, loading, fetchCompanyData, updateTrigger, refreshTrigger]);

  // Reset data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh trigger changed, resetting data state');
      setDataLoaded(false);
      setLoadAttempts(0);
    }
  }, [refreshTrigger]);

  return (
    <div>
      <Toast ref={toastRef} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-3xl font-bold text-gray-800">Fleet</h2>
        </div>
        <Button 
          icon="pi pi-plus" 
          className="p-button-rounded p-button-success" 
          aria-label="Add Fleet"
          onClick={() => onAddFleet(companyId)}
          style={{ width: '2.5rem', height: '2.5rem' }}
        />
      </div>
      
      {loading && !dataLoaded ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
          <div className="text-center">
            <i className="pi pi-spin pi-spinner text-blue-500 text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Fleet</h3>
            <p className="text-gray-600 text-center mb-2 max-w-md">
              Connecting to InstaCharter servers...
            </p>
            <p className="text-gray-500 text-sm mb-2">
              This might take up to a minute during peak times. Thanks for your patience.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                <i className="pi pi-info-circle mr-2"></i>
                If loading persists for more than 1 minute, please refresh the page and try again.
              </p>
            </div>
          </div>
        </div>
      ) : emptyState ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
          <div className="text-center">
            <i className="pi pi-plane text-blue-500 text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Fleet is Empty</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Add your first aircraft to start managing your fleet. Once added, your aircraft will be available for booking.
            </p>
            <Button 
              label="Add Your First Aircraft" 
              icon="pi pi-plus" 
              className="p-button-primary p-button-raised"
              onClick={() => onAddFleet(companyId)}
            />
          </div>
        </div>
      ) : (
        <DataTable 
          ref={dt}
          value={fleet.map(item => {
            // Log each item's registration field for debugging
            console.log('Fleet item being rendered:', item.id, 'Registration:', item.registration);
            // Ensure registration is never null or undefined
            return {...item, registration: item.registration || item.slNo || item.tail || ''};
          })} 
          editMode="cell" 
          dataKey="id"
          className="p-datatable-sm"
          emptyMessage="No fleet items found"
          loading={loading}
          loadingIcon="pi pi-spin pi-spinner"
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} fleet items"
          cellEditingCanceled={(e) => console.log('Cell editing canceled:', e)}
        >
          <Column 
            field="registration" 
            header="Registration" 
            editor={(props) => textEditor(props)} 
            style={{ cursor: 'pointer' }} 
            onCellEditComplete={handleCellEditChange} 
            body={registrationTemplate}
          />
          <Column 
            field="type" 
            header="Type" 
            editor={(props) => textEditor(props)} 
            style={{ cursor: 'pointer' }}
            onCellEditComplete={handleCellEditChange}
          />
          <Column 
            field="location" 
            header="Location" 
            editor={(props) => locationEditor(props)} 
            style={{ cursor: 'pointer' }}
            onCellEditComplete={handleCellEditChange}
          />
          <Column 
            field="currency" 
            header="Currency" 
            editor={(props) => currencyEditor(props)} 
            style={{ cursor: 'pointer' }}
            onCellEditComplete={handleCellEditChange}
          />
          <Column 
            field="perHour" 
            header="Per Hour" 
            editor={(props) => textEditor(props)} 
            style={{ cursor: 'pointer' }}
            body={perHourTemplate}
            onCellEditComplete={handleCellEditChange}
          />
          <Column 
            field="taxyTime" 
            header="Taxy Time" 
            editor={(props) => textEditor(props)} 
            style={{ cursor: 'pointer' }}
            onCellEditComplete={handleCellEditChange}
          />
          <Column field="na" header="NA" body={naTemplate} />
          <Column body={actionTemplate} header="Actions" style={{ width: '8rem' }} />
        </DataTable>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        visible={deleteDialogVisible}
        style={{ width: '450px' }}
        header="Confirm Delete"
        modal
        closable
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div className="flex justify-end space-x-2">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              className="p-button-text" 
              onClick={() => setDeleteDialogVisible(false)} 
            />
            <Button 
              label="Delete" 
              icon="pi pi-trash" 
              className="p-button-danger" 
              onClick={executeDelete} 
            />
          </div>
        }
      >
        <div className="flex items-center">
          <i className="pi pi-exclamation-triangle text-yellow-500 mr-3 text-2xl" />
          <span>
            Are you sure you want to delete this fleet item? This action cannot be undone.
          </span>
        </div>
      </Dialog>
    </div>
  );
};

export default FleetList; 