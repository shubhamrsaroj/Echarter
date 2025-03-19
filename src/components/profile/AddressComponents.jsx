// // AddressComponents.jsx
// import React, { useState, useCallback } from "react";
// import { MapPin, Save, X, Edit2 } from "lucide-react";
// import { Autocomplete, useLoadScript } from "@react-google-maps/api";

// const libraries = ["places"];

// export const AddressDisplay = ({ userDetails }) => {
//   // Extract and clean address components
//   const addressLine1 = userDetails.fullAddress?.address || "";
//   const city = userDetails.fullAddress?.city || "";
//   const state = userDetails.fullAddress?.state || "";
//   const postalCode = userDetails.fullAddress?.postalCode || "";
//   const country = userDetails.fullAddress?.country || "";

//   // Construct city, state, and postal code line only if they exist
//   const cityStatePostal = [city, state, postalCode]
//     .filter(Boolean)
//     .join(", ")
//     .trim();

//   return (
//     <div className="p-5 flex items-start">
//       <div className="text-gray-800 space-y-2">
//         {/* Address Line 1 */}
//         {addressLine1 && (
//           <div className="text-base font-medium">{addressLine1}</div>
//         )}
        
//         {/* City, State, Postal Code (optional line) */}
//         {cityStatePostal && (
//           <div className="text-sm text-gray-600">{cityStatePostal}</div>
//         )}
        
//         {/* Country */}
//         {country && (
//           <div className="text-base text-gray-800 font-medium">{country}</div>
//         )}
//       </div>
//     </div>
//   );
// };

// const AddressEditForm = ({ userDetails, onSave, onCancel }) => {
//   const [address, setAddress] = useState(userDetails.fullAddress?.address || "");
//   const [country, setCountry] = useState(userDetails.fullAddress?.country || "");
//   const [timeZoneOffset, setTimeZoneOffset] = useState("");

//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY, // Add your API key in .env
//     libraries,
//   });

//   const onPlaceChanged = (autocomplete) => {
//     const place = autocomplete.getPlace();
//     if (place.geometry) {
//       const addressComponents = place.address_components;
//       let countryName = "";

//       addressComponents.forEach(component => {
//         if (component.types.includes("country")) {
//           countryName = component.long_name;
//         }
//       });

//       const timeZone = place.utc_offset_minutes || 0;

//       setAddress(place.formatted_address);
//       setCountry(countryName);
//       setTimeZoneOffset(timeZone);
//     }
//   };

//   const handleSaveAddress = () => {
//     const updatedData = {
//       address: address,
//       country: country,
//       timeZoneOffset: timeZoneOffset
//     };
//     onSave("address", updatedData);
//   };

//   if (!isLoaded) return <div>Loading...</div>;

//   return (
//     <div className="p-5">
//       <div className="space-y-4">
//         <div>
//           <label className="text-sm text-gray-600">Address</label>
//           <Autocomplete
//             onLoad={(autocomplete) => {
//               autocomplete.addListener("place_changed", () => onPlaceChanged(autocomplete));
//             }}
//             onPlaceChanged={() => {}}
//           >
//             <input
//               type="text"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter your address"
//             />
//           </Autocomplete>
//         </div>
        
//         <div>
//           <label className="text-sm text-gray-600">Country</label>
//           <input
//             type="text"
//             value={country}
//             disabled
//             className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
//           />
//         </div>
        
//         <div>
//           <label className="text-sm text-gray-600">Time Zone Offset (minutes)</label>
//           <input
//             type="text"
//             value={timeZoneOffset}
//             disabled
//             className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
//           />
//         </div>
//       </div>
      
//       <div className="mt-4 flex justify-end gap-2">
//         <button
//           onClick={onCancel}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
//         >
//           <X className="mr-2 w-4 h-4" /> Cancel
//         </button>
//         <button
//           onClick={handleSaveAddress}
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
//         >
//           <Save className="mr-2 w-4 h-4" /> Save
//         </button>
//       </div>
//     </div>
//   );
// };

// export const AddressCard = ({ userDetails, editSection, onEditClick, onSave, onCancel }) => {
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
//       <div className="p-5 border-b border-gray-200 flex justify-between items-center">
//         <h2 className="text-xl font-semibold text-gray-800 flex items-center">
//           <MapPin className="mr-2 w-5 h-5" /> Address
//         </h2>
//         <Edit2
//           className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
//           onClick={onEditClick}
//         />
//       </div>
//       {editSection === "address" ? (
//         <AddressEditForm 
//           userDetails={userDetails}
//           onSave={onSave}
//           onCancel={onCancel}
//         />
//       ) : (
//         <AddressDisplay userDetails={userDetails} />
//       )}
//     </div>
//   );
// };

// export default AddressCard;



import React, { useState, useCallback } from "react";
import { MapPin, Save, X, Edit2 } from "lucide-react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

export const AddressDisplay = ({ userDetails }) => {
  // Safely access fullAddress with defaults
  const addressLine1 = userDetails?.fullAddress?.address || "";
  const city = userDetails?.fullAddress?.city || "";
  const state = userDetails?.fullAddress?.state || "";
  const postalCode = userDetails?.fullAddress?.postalCode || "";
  const country = userDetails?.fullAddress?.country || "";

  // Construct city, state, and postal code line only if they exist
  const cityStatePostal = [city, state, postalCode]
    .filter(Boolean)
    .join(", ")
    .trim();

  return (
    <div className="p-5 flex items-start">
      <div className="text-gray-800 space-y-2">
        {/* Address Line 1 */}
        {addressLine1 ? (
          <div className="text-base font-medium">{addressLine1}</div>
        ) : (
          <div className="text-sm text-gray-600">Not set</div>
        )}
        
        {/* City, State, Postal Code (optional line) */}
        {cityStatePostal && (
          <div className="text-sm text-gray-600">{cityStatePostal}</div>
        )}
        
        {/* Country */}
        {country && (
          <div className="text-base text-gray-800 font-medium">{country}</div>
        )}
      </div>
    </div>
  );
};

const AddressEditForm = ({ userDetails, onSave, onCancel }) => {
  const [address, setAddress] = useState(userDetails?.fullAddress?.address || "");
  const [country, setCountry] = useState(userDetails?.fullAddress?.country || "");
  const [timeZoneOffset, setTimeZoneOffset] = useState(userDetails?.fullAddress?.timeZoneOffset || "");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
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

  const handleSaveAddress = () => {
    const updatedData = {
      address: address,
      country: country,
      timeZoneOffset: timeZoneOffset
    };
    onSave("address", updatedData);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-5">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Address</label>
          <Autocomplete
            onLoad={(autocomplete) => {
              autocomplete.addListener("place_changed", () => onPlaceChanged(autocomplete));
            }}
            onPlaceChanged={() => {}}
          >
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your address"
            />
          </Autocomplete>
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Country</label>
          <input
            type="text"
            value={country}
            disabled
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Time Zone Offset (minutes)</label>
          <input
            type="text"
            value={timeZoneOffset}
            disabled
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
        >
          <X className="mr-2 w-4 h-4" /> Cancel
        </button>
        <button
          onClick={handleSaveAddress}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
        >
          <Save className="mr-2 w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
};

export const AddressCard = ({ userDetails, editSection, onEditClick, onSave, onCancel }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <MapPin className="mr-2 w-5 h-5" /> Address
        </h2>
        <Edit2
          className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
          onClick={onEditClick}
        />
      </div>
      {editSection === "address" ? (
        <AddressEditForm 
          userDetails={userDetails}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : (
        <AddressDisplay userDetails={userDetails} />
      )}
    </div>
  );
};

export default AddressCard;