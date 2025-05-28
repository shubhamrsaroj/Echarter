import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CircleUserRound,
  LogOut,
  User,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  MessagesSquare
} from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { tokenHandler } from '../../utils/tokenHandler';
import sidebarLogo from '../../assets/sidebar_logo.svg';

const Sidebar = ({ onExpandChange }) => {
  const { logout } = useContext(AuthContext);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenHandler.clearAllTokens();
    logout();
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setProfileDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
    onExpandChange?.(!expanded);
  };
  
  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-[#f0f7ff] border-r border-gray-200 transition-all duration-300 ease-in-out ${
        expanded ? 'w-48' : 'w-16'
      } flex flex-col z-10`}
    >
      {/* Professional Toggle Button */}
      <div className={`absolute -right-4 z-20 transition-all duration-300 ${
        expanded ? 'top-8' : 'top-20'
      }`}>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {expanded ? (
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
          )}
        </button>
      </div>

      {/* Logo Section with Professional Scaling */}
      <div className={`flex items-center justify-center transition-all duration-300 ${
        expanded ? 'h-28 px-4 py-4' : 'h-24 px-2 py-3'
      }`}>
        <img 
          src={sidebarLogo} 
          alt="EasyCharter Logo" 
          className={`transition-all duration-300 object-contain ${
            expanded ? 'h-20 w-auto max-w-full' : 'h-12 w-auto'
          }`}
        />
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-0.5 mt-4">
        <NavLink
          to="/conversation"
          className={({ isActive }) =>
            `flex flex-col items-center w-full px-2 py-3.5 text-xs font-medium transition-all duration-200 rounded-lg mx-1 ${
              isActive ? "bg-blue-50" : "hover:bg-blue-50"
            }`
          }
        >
          <MessagesSquare size={36} className="text-gray-700" />
          {expanded && <span className="text-gray-700 text-xs mt-2">Activity</span>}
        </NavLink>
      </div>

      {/* Profile & Help Section */}
      <div className="mt-auto">
        <div className="relative px-0.5 mb-1">
          <button
            onClick={toggleProfileDropdown}
            className={`flex flex-col items-center w-full px-2 py-3.5 text-xs font-medium hover:bg-blue-50 transition-all duration-200 rounded-lg mx-1`}
          >
            <CircleUserRound size={36} className="text-gray-700" />
            {expanded && <span className="text-gray-700 text-xs mt-2">Profile</span>}
          </button>

          {profileDropdownOpen && expanded && (
            <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 mb-1 overflow-hidden">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-3 py-2.5 text-xs font-medium hover:bg-blue-50 transition-colors"
              >
                <User size={26} className="mr-2 text-gray-700" />
                <span className="text-gray-700">View Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2.5 text-xs font-medium hover:bg-blue-50 transition-colors"
              >
                <LogOut size={26} className="mr-2 text-gray-700" />
                <span className="text-gray-700">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Option */}
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex flex-col items-center px-2 py-3.5 text-xs font-medium transition-all duration-200 rounded-lg mx-1 ${
              isActive ? "bg-blue-50" : "hover:bg-blue-50"
            }`
          }
        >
          <CircleHelp size={36} className="text-gray-700" />
          {expanded && <span className="text-gray-700 text-xs mt-2">Help</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;