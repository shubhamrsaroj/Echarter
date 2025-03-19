// import React, { useState } from "react";
// import { Phone, Edit2, Save, X } from "lucide-react";
// import { userService } from "../../api/profile/userService";
// import { useUserDetails } from "../../context/profile/UserDetailsContext";

// const PhoneNumber = ({ userDetails, editSection, setEditSection, handleSave }) => {
//   const [phoneNumber, setPhoneNumber] = useState(userDetails.phoneNumber || "");
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const { fetchUserDetails } = useUserDetails();

//   const handleEditClick = () => {
//     setEditSection("phone");
//     setPhoneNumber(userDetails.phoneNumber || "");
//     setIsVerifying(false);
//     setOtp("");
//     setError("");
//   };

//   const handlePhoneChange = (e) => {
//     setPhoneNumber(e.target.value);
//   };

//   const handleOtpChange = (e) => {
//     setOtp(e.target.value);
//   };

//   const sendVerificationOTP = async () => {
//     try {
//       setError("");
//       await userService.sendMobileVerificationOTP(phoneNumber);
//       setIsVerifying(true);
//     } catch (err) {
//       setError("Failed to send verification OTP. Please try again.");
//     }
//   };

//   const verifyOTP = async () => {
//     try {
//       setError("");
//       await userService.verifyMobileOTP(phoneNumber, otp);
//       await handleSave("phone", { phoneNumber }); // Use handleSave for consistency
//       await fetchUserDetails(); // Refresh user details
//       setEditSection(null);
//       setIsVerifying(false);
//       setOtp("");
//     } catch (err) {
//       setError("Invalid OTP. Please try again.");
//     }
//   };

//   const handleSavePhone = () => {
//     if (isVerifying) {
//       verifyOTP();
//     } else if (phoneNumber !== userDetails.phoneNumber) {
//       sendVerificationOTP();
//     } else {
//       handleSave("phone", { phoneNumber });
//       setEditSection(null);
//     }
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
//       <div className="p-5 border-b border-gray-200 flex justify-between items-center">
//         <h2 className="text-xl font-semibold text-gray-800 flex items-center">
//           <Phone className="mr-2 w-5 h-5" /> Phone Number
//         </h2>
//         <Edit2
//           className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
//           onClick={handleEditClick}
//         />
//       </div>
//       {editSection === "phone" ? (
//         <div className="p-5">
//           <div className="space-y-4">
//             <div className="flex items-center">
//               <input
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={handlePhoneChange}
//                 className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter phone number"
//               />
//             </div>
//             {isVerifying && (
//               <div className="flex items-center">
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={handleOtpChange}
//                   className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter verification code"
//                 />
//               </div>
//             )}
//             {error && <div className="text-red-500 text-sm">{error}</div>}
//           </div>
//           <div className="mt-4 flex justify-end gap-2">
//             <button
//               onClick={() => {
//                 setEditSection(null);
//                 setIsVerifying(false);
//                 setOtp("");
//                 setError("");
//               }}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
//             >
//               <X className="mr-2 w-4 h-4" /> Cancel
//             </button>
//             <button
//               onClick={handleSavePhone}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
//             >
//               <Save className="mr-2 w-4 h-4" /> {isVerifying ? "Verify" : "Save"}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="p-5 flex items-center">
//           <div className="text-gray-800 text-lg">{userDetails?.phoneNumber}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhoneNumber;





import React, { useState } from "react";
import { Phone, Edit2, Save, X } from "lucide-react";
import { userService } from "../../api/profile/user.service";
import { useUserDetails } from "../../context/profile/UserDetailsContext";

const PhoneNumber = ({ userDetails, editSection, setEditSection, handleSave }) => {
  const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber || ""); // Safe access
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { fetchUserDetails } = useUserDetails();

  const handleEditClick = () => {
    setEditSection("phone");
    setPhoneNumber(userDetails?.phoneNumber || ""); // Safe access
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
      setError("");
      await userService.sendMobileVerificationOTP(phoneNumber);
      setIsVerifying(true);
    } catch (err) {
      setError("Failed to send verification OTP. Please try again.");
    }
  };

  const verifyOTP = async () => {
    try {
      setError("");
      await userService.verifyMobileOTP(phoneNumber, otp);
      await handleSave("phone", { phoneNumber }); // This now includes token refresh
      await fetchUserDetails();
      setEditSection(null);
      setIsVerifying(false);
      setOtp("");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleSavePhone = () => {
    if (isVerifying) {
      verifyOTP();
    } else if (phoneNumber !== (userDetails?.phoneNumber || "")) { // Safe comparison
      sendVerificationOTP();
    } else {
      handleSave("phone", { phoneNumber });
      setEditSection(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Phone className="mr-2 w-5 h-5" /> Phone Number
        </h2>
        <Edit2
          className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
          onClick={handleEditClick}
        />
      </div>
      {editSection === "phone" ? (
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            {isVerifying && (
              <div className="flex items-center">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter verification code"
                />
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditSection(null);
                setIsVerifying(false);
                setOtp("");
                setError("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
            >
              <X className="mr-2 w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSavePhone}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
            >
              <Save className="mr-2 w-4 h-4" /> {isVerifying ? "Verify" : "Save"}
            </button>
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