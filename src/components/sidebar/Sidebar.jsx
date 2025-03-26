import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  CircleUserRound,
  LogOut,
  MessagesSquare,
  Activity,
  Gem,
  User,
  CircleHelp
} from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { tokenHandler } from '../../utils/tokenHandler';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const [userRoles, setUserRoles] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      if (userData && userData.role) {
        const rolesArray = userData.role.split(',').map(role => role.trim());
        setUserRoles(rolesArray);
        console.log('User roles:', rolesArray);
      }
    }
  }, []);

  const allNavLinks = [
    { name: 'Search', path: '/itinerary', icon: <Search size={30} /> },
    { name: 'Chats', path: '/conversation', icon: <MessagesSquare size={30} /> },
    {
      name: 'Sellers',
      path: '/seller',
      icon: <Gem size={30} />,
      allowedRoles: ['User', 'Operator']
    },
    { name: 'Activity', path: '/activity', icon: <Activity size={30} /> },
  ];

  const navLinks = allNavLinks.filter(link => {
    if (!link.allowedRoles) return true;
    return link.allowedRoles.some(allowedRole => 
      userRoles.some(userRole => userRole === allowedRole)
    );
  });

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
    <div className="hidden md:flex flex-col w-60 bg-gray-100 border-r border-gray-300">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 p-4">
        <img src={logo} alt="EasyCharter Logo" className="h-16 w-full" />
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-200 text-black'
                    : 'text-black hover:bg-gray-300'
                }`
              }
            >
              <span className="text-black mb-1">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Profile Option with Dropdown and Help */}
      <div className="mt-auto px-2 py-4 mb-4">
        <div className="relative">
          <button
            onClick={toggleProfileDropdown}
            className="flex flex-col items-center w-full px-4 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-300"
          >
            <CircleUserRound size={30} className="text-black mb-1" />
            <span className="text-xs">Profile</span>
          </button>
          
          {profileDropdownOpen && (
            <div className="absolute bottom-full left-0 w-full bg-gray-100 border border-gray-200 rounded-md shadow-lg z-10 mb-1">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-300"
              >
                <User size={30} className="mr-3 text-black" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-300"
              >
                <LogOut size={30} className="mr-3 text-black" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Option */}
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex flex-col items-center px-4 py-2 text-sm font-medium rounded-md mt-2 ${
              isActive
                ? 'bg-gray-200 text-black'
                : 'text-black hover:bg-gray-300'
            }`
          }
        >
          <CircleHelp size={30} className="text-black mb-1" />
          <span className="text-xs">Help</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;