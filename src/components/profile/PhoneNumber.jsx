import React, { useState, useEffect } from "react";
import { Phone, Edit2, Save, X, Check } from "lucide-react";
import { userService } from "../../api/profile/user.service";
import { countryService } from "../../api/profile/countryService";
import { useUserDetails } from "../../context/profile/UserDetailsContext";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from "react";

const PhoneNumber = ({ userDetails, editSection, setEditSection, handleSave }) => {
  const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { fetchUserDetails } = useUserDetails();
  const toast = useRef(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAllCountries();
        if (data && Array.isArray(data.data)) {
          const formattedCountries = data.data.map(country => ({
            name: country.name,
            code: country.dialCode || country.code,
            flag: country.flag
          }));
          setCountries(formattedCountries);
          
          // Try to determine the current country from the phone number
          if (phoneNumber && phoneNumber.startsWith('+')) {
            const countryCode = phoneNumber.split(' ')[0];
            const country = formattedCountries.find(c => countryCode.includes(c.code));
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

    if (editSection === "phone") {
      fetchCountries();
    }
  }, [editSection, phoneNumber]);

  const handleEditClick = () => {
    setEditSection("phone");
    setPhoneNumber(userDetails?.phoneNumber || "");
    setIsVerifying(false);
    setOtp("");
    setError("");
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const sendVerificationOTP = async () => {
    try {
      setIsLoading(true);
      setError("");
      const formattedPhone = selectedCountry ? `${selectedCountry.code} ${phoneNumber}` : phoneNumber;
      await userService.sendMobileVerificationOTP(formattedPhone);
      setIsVerifying(true);
      toast.current.show({ severity: 'info', summary: 'OTP Sent', detail: 'Verification code has been sent to your phone', life: 3000 });
    } catch (err) {
      setError("Failed to send verification OTP. Please try again.");
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send verification OTP', life: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setIsLoading(true);
      setError("");
      const formattedPhone = selectedCountry ? `${selectedCountry.code} ${phoneNumber}` : phoneNumber;
      await userService.verifyMobileOTP(formattedPhone, otp);
      await handleSave("phone", { phoneNumber: formattedPhone });
      await fetchUserDetails();
      setEditSection(null);
      setIsVerifying(false);
      setOtp("");
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Phone number verified and saved successfully', life: 3000 });
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid OTP. Please try again.', life: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePhone = () => {
    if (isVerifying) {
      verifyOTP();
    } else if (phoneNumber !== (userDetails?.phoneNumber || "")) {
      sendVerificationOTP();
    } else {
      const formattedPhone = selectedCountry ? `${selectedCountry.code} ${phoneNumber}` : phoneNumber;
      handleSave("phone", { phoneNumber: formattedPhone });
      setEditSection(null);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Phone number saved successfully', life: 3000 });
    }
  };

  const countryTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        {option.flag && <img src={option.flag} alt={option.name} style={{ width: '18px', marginRight: '8px' }} />}
        <span>{option.name} ({option.code})</span>
      </div>
    );
  };

  const selectedCountryTemplate = (option) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          {option.flag && <img src={option.flag} alt={option.name} style={{ width: '18px', marginRight: '8px' }} />}
          <span>{option.code}</span>
        </div>
      );
    }
    return <span>Select Country</span>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <Toast ref={toast} />
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Phone className="mr-2 w-5 h-5" /> Phone Number
        </h2>
        {editSection !== "phone" && (
          <Button 
            icon="pi pi-pencil" 
            className="p-button-text p-button-rounded" 
            onClick={handleEditClick}
            aria-label="Edit"
          />
        )}
      </div>
      {editSection === "phone" ? (
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {countries.length > 0 && (
                <Dropdown
                  value={selectedCountry}
                  options={countries}
                  onChange={(e) => setSelectedCountry(e.value)}
                  optionLabel="name"
                  placeholder="Select Country"
                  valueTemplate={selectedCountryTemplate}
                  itemTemplate={countryTemplate}
                  className="w-40"
                />
              )}
              <InputText
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1"
                placeholder="Enter phone number"
              />
            </div>
            {isVerifying && (
              <div className="flex items-center">
                <InputText
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="flex-1"
                  placeholder="Enter verification code"
                />
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={() => {
                setEditSection(null);
                setIsVerifying(false);
                setOtp("");
                setError("");
              }}
            />
            <Button
              label={isLoading
                ? isVerifying
                  ? "Verifying OTP..."
                  : "Sending OTP..."
                : isVerifying
                  ? "Verify"
                  : "Save"}
              icon={isVerifying ? "pi pi-check" : "pi pi-save"}
              onClick={handleSavePhone}
              disabled={isLoading}
              loading={isLoading}
              className="p-button-primary"
            />
          </div>
        </div>
      ) : (
        <div className="p-5 flex items-center">
          <div className="text-gray-800 text-lg">{userDetails?.phoneNumber || "Not set"}</div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumber;