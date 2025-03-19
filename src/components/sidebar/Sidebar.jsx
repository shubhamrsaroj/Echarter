import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Ticket, User, LogOut, MessageCircle  } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { tokenHandler } from '../../utils/tokenHandler';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  
  const navLinks = [
    { name: 'Itinerary', path: '/itinerary', icon: <Home size={20} /> },
    { name: 'Search Flights', path: '/search', icon: <Search size={20} /> },
    { name: 'Conversation', path: '/conversation', icon: <MessageCircle size={20} /> }, 
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  // Access the logo URL from the Vite environment variable
  const logo = import.meta.env.VITE_LOGO;

  const handleLogout = () => {
    // Use the tokenHandler to destroy all tokens from cookies
    tokenHandler.clearAllTokens();
    // Then call the logout function from AuthContext to update app state
    logout();
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 p-4">
        <img src={logo} alt="EasyCharter Logo" className="h-16 w-full" />
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-700' // Active link style
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' // Inactive link style
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Logout Option */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
        >
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;