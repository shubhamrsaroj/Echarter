import React from "react";

const AuthLayout = ({ children }) => {
  // Get the logo URL from environment variables
  const logoUrl = import.meta.env.VITE_LOGO || "";

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Dynamic Content */}
      <div className="w-1/2 min-h-screen flex items-center justify-center bg-gray-50 p-4">
        {children}
      </div>

      {/* Right Section - Fixed Content */}
      <div
        className="w-1/2 min-h-screen bg-white flex flex-col items-center justify-center p-16 fixed right-0"
        style={{ willChange: "transform" }}
      >
        {/* Logo and Tagline Container */}
        <div className="flex flex-col items-center gap-0">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="w-auto h-30 w-62 block"
            />
          )}
          <p className="text-black text-center text-lg mt-0 leading-tight">
            Global Air Charter Marketplace on your PC
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
