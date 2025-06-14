import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { toast } from 'react-toastify';
import { tokenHandler } from '../../utils/tokenHandler';
import { Autocomplete } from '@react-google-maps/api';
import { countryService } from '../../api/profile/countryService';

const AddCompanyForm = ({ visible, onHide, userDetails, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    roles: "seller",
    email: "",
    phone: "",
    street: "",
    aptSuite: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    primaryRole: ""
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [countries, setCountries] = useState([]);
  const [roles] = useState([
    { label: 'Broker', value: 'broker' },
    { label: 'Aircraft Operator', value: 'operator' },
    { label: 'Travel Agent', value: 'agent' }
  ]);
  
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [autocompleteRef, setAutocompleteRef] = useState(null);
  
  // Check if Google Maps API is loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true);
    } else {
      // Poll for Google Maps API to be loaded
      const checkGoogleMapsInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setGoogleMapsLoaded(true);
          clearInterval(checkGoogleMapsInterval);
        }
      }, 500);
      
      return () => clearInterval(checkGoogleMapsInterval);
    }
  }, []);
  
  // Fetch countries for dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await countryService.getAllCountries();
        if (response && response.success && Array.isArray(response.data)) {
          const formattedCountries = response.data.map(country => ({
            label: country.country,
            value: country.country
          }));
          setCountries(formattedCountries);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchCountries();
  }, []);
  
  // Reset form when dialog is hidden
  useEffect(() => {
    if (!visible) {
      setFormData({
        name: "",
        roles: "seller",
        email: "",
        phone: "",
        street: "",
        aptSuite: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        primaryRole: ""
      });
      setErrors({});
      setTouched({});
    }
  }, [visible]);
  
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value) error = 'Company name is required';
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        break;
      case 'street':
        if (!value) error = 'Address is required';
        break;
      case 'primaryRole':
        if (!value) error = 'Primary role is required';
        break;
      default:
        break;
    }
    
    return error;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handlePlaceSelect = () => {
    if (autocompleteRef) {
      const place = autocompleteRef.getPlace();
      
      if (place && place.address_components) {
        let street = "";
        let city = "";
        let state = "";
        let country = "";
        let zipcode = "";
        
        // Extract address components
        place.address_components.forEach(component => {
          const types = component.types;
          
          if (types.includes("street_number")) {
            street = component.long_name;
          }
          
          if (types.includes("route")) {
            street = street ? `${street} ${component.long_name}` : component.long_name;
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
        
        // If street is empty, use formatted_address
        if (!street && place.formatted_address) {
          const parts = place.formatted_address.split(',');
          if (parts.length > 0) {
            street = parts[0].trim();
          }
        }
        
        // Update form data
        const updatedFormData = {
          ...formData,
          street,
          city,
          state,
          country,
          zipcode
        };
        
        setFormData(updatedFormData);
        
        // Mark address as touched and validate
        setTouched(prev => ({
          ...prev,
          street: true
        }));
        
        setErrors(prev => ({
          ...prev,
          street: validateField('street', street)
        }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;
    
    // Validate all required fields
    const requiredFields = ['name', 'email', 'phone', 'street', 'primaryRole'];
    requiredFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) isValid = false;
    });
    
    setErrors(newErrors);
    setTouched(newTouched);
    
    return isValid;
  };
  
  const handleSubmit = async () => {
    // Validate all fields
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare payload according to API requirements
      const payload = {
        name: formData.name,
        roles: formData.primaryRole || "seller",
        email: formData.email,
        phone: formData.phone,
        street: formData.street + (formData.aptSuite ? `, ${formData.aptSuite}` : ''),
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
        currency: userDetails?.currency || "USD",
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
      
      console.log('Submitting company data:', payload);
      
      // Call the API
      const response = await fetch(
        "https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/AddCompanies",
        {
          method: 'POST',
          headers: {
            "accept": "text/plain",
            "X-Api-Key": "instacharter@2025",
            "Authorization": `Bearer ${tokenHandler.getToken()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Company added successfully!");
        
        // Reset form
        setFormData({
          name: "",
          roles: "seller",
          email: "",
          phone: "",
          street: "",
          aptSuite: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          primaryRole: ""
        });
        
        // Close dialog and notify parent
        onHide();
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else {
        toast.error(`Failed to add company: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("An error occurred while adding the company");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog
      header="Add Company"
      visible={visible}
      onHide={onHide}
      style={{ width: '500px' }}
      breakpoints={{ '960px': '80vw', '641px': '95vw' }}
      footer={
        <div className="flex justify-end gap-2">
          <Button 
            label="Cancel" 
            className="p-button-outlined" 
            onClick={onHide} 
          />
          <Button 
            label="Add" 
            className="p-button-primary" 
            onClick={handleSubmit}
            loading={isSubmitting}
          />
        </div>
      }
    >
      <div className="p-fluid">
        <div className="field mb-4">
          <label htmlFor="name" className="block font-medium mb-1">
            Company Name<span className="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name && touched.name ? 'p-invalid' : ''}
            required
          />
          {errors.name && touched.name && (
            <small className="p-error block mt-1">{errors.name}</small>
          )}
        </div>
        
        <div className="field mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Email Address<span className="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email && touched.email ? 'p-invalid' : ''}
            required
          />
          {errors.email && touched.email && (
            <small className="p-error block mt-1">{errors.email}</small>
          )}
        </div>
        
        <div className="field mb-4">
          <label htmlFor="phone" className="block font-medium mb-1">
            Phone<span className="text-red-500">*</span>
          </label>
          <InputText
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone && touched.phone ? 'p-invalid' : ''}
            required
          />
          {errors.phone && touched.phone && (
            <small className="p-error block mt-1">{errors.phone}</small>
          )}
        </div>
        
        <div className="field mb-4">
          <label htmlFor="street" className="block font-medium mb-1">
            Address<span className="text-red-500">*</span>
          </label>
          {googleMapsLoaded ? (
            <Autocomplete
              onLoad={(autocomplete) => {
                setAutocompleteRef(autocomplete);
              }}
              onPlaceChanged={handlePlaceSelect}
              options={{
                types: ["address"],
                fields: ["address_components", "formatted_address", "geometry", "name"]
              }}
            >
              <InputText
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Start typing to search for an address"
                required
                className={`mb-2 ${errors.street && touched.street ? 'p-invalid' : ''}`}
              />
            </Autocomplete>
          ) : (
            <InputText
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
              className={`mb-2 ${errors.street && touched.street ? 'p-invalid' : ''}`}
            />
          )}
          {errors.street && touched.street && (
            <small className="p-error block mt-1">{errors.street}</small>
          )}
          <InputText
            id="aptSuite"
            name="aptSuite"
            value={formData.aptSuite}
            onChange={handleInputChange}
            placeholder="Apt, suite, unit, building, floor, etc."
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="field">
            <label htmlFor="city" className="block font-medium mb-1">City</label>
            <InputText
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="field">
            <label htmlFor="state" className="block font-medium mb-1">State</label>
            <InputText
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="field">
            <label htmlFor="zipcode" className="block font-medium mb-1">ZIP</label>
            <InputText
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="field mb-4">
          <label htmlFor="country" className="block font-medium mb-1">Country</label>
          <Dropdown
            id="country"
            name="country"
            value={formData.country}
            options={countries}
            onChange={(e) => handleInputChange({
              target: { name: 'country', value: e.value }
            })}
            placeholder="Select a country"
            className="w-full"
          />
        </div>
        
        <div className="field mb-4">
          <label htmlFor="primaryRole" className="block font-medium mb-1">
            Primary Role<span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="primaryRole"
            name="primaryRole"
            value={formData.primaryRole}
            options={roles}
            onChange={(e) => handleInputChange({
              target: { name: 'primaryRole', value: e.value }
            })}
            placeholder="Select a role"
            className={`w-full ${errors.primaryRole && touched.primaryRole ? 'p-invalid' : ''}`}
            required
          />
          {errors.primaryRole && touched.primaryRole && (
            <small className="p-error block mt-1">{errors.primaryRole}</small>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>
    </Dialog>
  );
};

export default AddCompanyForm; 