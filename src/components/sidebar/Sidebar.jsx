import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  CircleUserRound,
  LogOut,
  MessagesSquare,
  Gem,
  User,
  CircleHelp,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { tokenHandler } from '../../utils/tokenHandler';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Get user role from token
  const token = tokenHandler.getToken();
  const userData = token ? tokenHandler.parseUserFromToken(token) : null;
  const userRoles = (userData?.role || '').split(',').map(role => role.trim());

  const canSeeSellers = userRoles.some(role => ['Broker', 'Operator'].includes(role));
  // const canSeeSellers = userRoles.some(role => ['Broker', 'Operator','User'].includes(role));

  const baseNavLinks = [
    { name: 'Search', path: '/search', icon: <Search size={30} /> },
    { name: 'Activity', path: '/conversation', icon: <MessagesSquare size={30} /> },
  ];

  // Add Sellers link conditionally
  const navLinks = canSeeSellers 
    ? [...baseNavLinks.slice(0, 1), { name: 'Sellers', path: '/seller', icon: <Gem size={30} /> }, ...baseNavLinks.slice(1)]
    : baseNavLinks;

  const logo = import.meta.env.VITE_LOGO;

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
  
  return (
    <div 
      className={`hidden md:flex flex-col bg-gray-50 border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
        expanded ? 'w-60' : 'w-20'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo Section */}
      <div className={`flex items-center ${expanded ? 'justify-center' : 'justify-center'} h-20 p-4`}>
        {expanded ? (
          <img src={logo} alt="EasyCharter Logo" className="h-25 w-auto rounded-2xl" />
        ) : (
          <img src={logo} alt="EasyCharter Logo" className="h-10 w-auto rounded-2xl" />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navLinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex ${expanded ? 'flex-col' : 'justify-center'} items-center px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive ? "bg-gray-100" : "hover:bg-gray-200"
              }`
            }
          >
            <span className="text-black mb-1">{item.icon}</span>
            {expanded && <span className="text-black text-xs">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Help Section */}
      <div className="mt-auto px-3 py-4">
        <div className="relative">
          <button
            onClick={toggleProfileDropdown}
            className={`flex ${expanded ? 'flex-col' : 'justify-center'} items-center w-full px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-200 transition`}
          >
            <CircleUserRound size={30} className="text-black mb-1" />
            {expanded && <span className="text-black text-xs">Profile</span>}
          </button>

          {profileDropdownOpen && expanded && (
            <div className="absolute bottom-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md z-10 mb-2">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-gray-200"
              >
                <User size={30} className="mr-3 text-black" />
                <span className="text-black">View Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-gray-200"
              >
                <LogOut size={30} className="mr-3 text-black" />
                <span className="text-black">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Option */}
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex ${expanded ? 'flex-col' : 'justify-center'} items-center px-4 py-3 text-sm font-medium rounded-md mt-3 transition ${
              isActive ? "bg-gray-200" : "hover:bg-gray-200"
            }`
          }
        >
          <CircleHelp size={30} className="text-black mb-1" />
          {expanded && <span className="text-black text-xs">Help</span>}
        </NavLink>
      </div>

      {/* Collapse indicator */}
      <div className={`absolute top-1/2 -right-3 bg-gray-100 rounded-full p-1 border border-gray-200 shadow-sm ${expanded ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <ChevronRight size={16} className="text-gray-500" />
      </div>
    </div>
  );
};

export default Sidebar;
