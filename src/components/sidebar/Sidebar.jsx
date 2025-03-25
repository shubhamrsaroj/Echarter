// import React, { useContext, useEffect, useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   Search,
//   CircleUserRound,
//   LogOut,
//   MessagesSquare,
//   Activity,
//   CalendarClock
// } from 'lucide-react';
// import { AuthContext } from '../../context/auth/AuthContext';
// import { tokenHandler } from '../../utils/tokenHandler';

// const Sidebar = () => {
//   const { logout } = useContext(AuthContext);
//   const [userRoles, setUserRoles] = useState([]);
  
//   useEffect(() => {
//     // Get the current token and extract user data on component mount
//     const token = tokenHandler.getToken();
//     if (token) {
//       const userData = tokenHandler.parseUserFromToken(token);
//       if (userData && userData.role) {
//         // Split the comma-separated roles and trim whitespace
//         const rolesArray = userData.role.split(',').map(role => role.trim());
//         setUserRoles(rolesArray);
        
//         console.log('User roles:', rolesArray);
//       }
//     }
//   }, []);
  
//   // All navigation links
//   const allNavLinks = [
//     { name: 'Search', path: '/itinerary', icon: <Search size={20} /> },
    
//     { name: 'Chat', path: '/conversation', icon: <MessagesSquare  size={20} /> },
//     {
//       name: 'Seller',
//       path: '/seller',
//       icon: <CalendarClock size={20} />,
//       allowedRoles: ['User', 'Operator'] // Only show for these roles
//     },
//     { name: 'Activity', path: '/activity', icon: <Activity size={20} /> },
   
//     { name: 'Profile', path: '/profile', icon: <CircleUserRound size={20} /> },
//   ];
  
//   // Filter links based on user roles
//   const navLinks = allNavLinks.filter(link => {
//     // If no role restriction, show to everyone
//     if (!link.allowedRoles) return true;
    
//     // Check if any of the user's roles match any of the allowed roles
//     return link.allowedRoles.some(allowedRole => 
//       userRoles.some(userRole => userRole === allowedRole)
//     );
//   });
  
//   // Access the logo URL from the Vite environment variable
//   const logo = import.meta.env.VITE_LOGO;
  
//   const handleLogout = () => {
//     // Use the tokenHandler to destroy all tokens from cookies
//     tokenHandler.clearAllTokens();
//     // Then call the logout function from AuthContext to update app state
//     logout();
//   };
  
//   return (
//     <div className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800">
//       {/* Logo Section */}
//       <div className="flex items-center justify-center h-16 p-4">
//         <img src={logo} alt="EasyCharter Logo" className="h-16 w-full" />
//       </div>
      
//       {/* Navigation Links */}
//       <div className="flex flex-col flex-1 overflow-y-auto">
//         <nav className="flex-1 px-2 py-4 space-y-1">
//           {navLinks.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
//                   isActive
//                     ? 'bg-gray-800 text-white' // Active link style
//                     : 'text-white hover:bg-gray-900' // Inactive link style - now always white
//                 }`
//               }
//             >
//               <span className="mr-3 text-white">{item.icon}</span>
//               <span>{item.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
      
//       {/* Logout Option */}
//       <div className="border-t border-gray-800 p-4">
//         <button
//           onClick={handleLogout}
//           className="flex items-center w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-900"
//         >
//           <LogOut size={20} className="mr-3 text-white" />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;




// import React, { useContext, useEffect, useState } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import {
//   Search,
//   CircleUserRound,
//   LogOut,
//   MessagesSquare,
//   Activity,
//   Gem,
//   User,
//   CircleHelp // Added CircleHelp import
// } from 'lucide-react';
// import { AuthContext } from '../../context/auth/AuthContext';
// import { tokenHandler } from '../../utils/tokenHandler';

// const Sidebar = () => {
//   const { logout } = useContext(AuthContext);
//   const [userRoles, setUserRoles] = useState([]);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = tokenHandler.getToken();
//     if (token) {
//       const userData = tokenHandler.parseUserFromToken(token);
//       if (userData && userData.role) {
//         const rolesArray = userData.role.split(',').map(role => role.trim());
//         setUserRoles(rolesArray);
//         console.log('User roles:', rolesArray);
//       }
//     }
//   }, []);

//   const allNavLinks = [
//     { name: 'Search', path: '/itinerary', icon: <Search size={20} /> },
//     { name: 'Chats', path: '/conversation', icon: <MessagesSquare size={20} /> },
//     {
//       name: 'Sellers',
//       path: '/seller',
//       icon: <Gem size={20} />,
//       allowedRoles: ['User', 'Operator']
//     },
//     { name: 'Activity', path: '/activity', icon: <Activity size={20} /> },
//   ];

//   const navLinks = allNavLinks.filter(link => {
//     if (!link.allowedRoles) return true;
//     return link.allowedRoles.some(allowedRole => 
//       userRoles.some(userRole => userRole === allowedRole)
//     );
//   });

//   const logo = import.meta.env.VITE_LOGO;

//   const handleLogout = () => {
//     tokenHandler.clearAllTokens();
//     logout();
//   };

//   const toggleProfileDropdown = () => {
//     setProfileDropdownOpen(!profileDropdownOpen);
//   };

//   const handleViewProfile = () => {
//     navigate('/profile');
//     setProfileDropdownOpen(false);
//   };

//   return (
//     <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
//       {/* Logo Section */}
//       <div className="flex items-center justify-center h-16 p-4">
//         <img src={logo} alt="EasyCharter Logo" className="h-16 w-full" />
//       </div>
      
//       {/* Navigation Links */}
//       <div className="flex flex-col flex-1 overflow-y-auto">
//         <nav className="flex-1 px-2 py-4 space-y-1">
//           {navLinks.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
//                   isActive
//                     ? 'bg-gray-100 text-black'
//                     : 'text-black hover:bg-gray-50'
//                 }`
//               }
//             >
//               <span className="mr-3 text-black">{item.icon}</span>
//               <span>{item.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
      
//       {/* Profile Option with Dropdown and Help */}
//       <div className="mt-auto px-2 py-4 mb-4">
//         <div className="relative">
//           <button
//             onClick={toggleProfileDropdown}
//             className="flex items-center w-full px-4 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-50"
//           >
//             <CircleUserRound size={20} className="mr-3 text-black" />
//             <span>Profile</span>
//           </button>
          
//           {profileDropdownOpen && (
//             <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mb-1">
//               <button
//                 onClick={handleViewProfile}
//                 className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
//               >
//                 <User size={18} className="mr-3 text-black" />
//                 <span>View Profile</span>
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
//               >
//                 <LogOut size={18} className="mr-3 text-black" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Help Option */}
//         <NavLink
//           to="/help"
//           className={({ isActive }) =>
//             `flex items-center px-4 py-2 text-sm font-medium rounded-md mt-1 ${
//               isActive
//                 ? 'bg-gray-100 text-black'
//                 : 'text-black hover:bg-gray-50'
//             }`
//           }
//         >
//           <CircleHelp size={20} className="mr-3 text-black" />
//           <span>Help</span>
//         </NavLink>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;






import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  CircleUserRound,
  LogOut,
  MessagesSquare,
  Activity,
  Gem,
  User
} from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { tokenHandler } from '../../utils/tokenHandler';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const [userRoles, setUserRoles] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current token and extract user data on component mount
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      if (userData && userData.role) {
        // Split the comma-separated roles and trim whitespace
        const rolesArray = userData.role.split(',').map(role => role.trim());
        setUserRoles(rolesArray);
        
        console.log('User roles:', rolesArray);
      }
    }
  }, []);

  // All navigation links
  const allNavLinks = [
    { name: 'Search', path: '/itinerary', icon: <Search size={20} /> },
    { name: 'Chats', path: '/conversation', icon: <MessagesSquare size={20} /> },
    {
      name: 'Sellers',
      path: '/seller',
      icon: <Gem size={20} />,
      allowedRoles: ['User', 'Operator'] // Only show for these roles
    },
    { name: 'Activity', path: '/activity', icon: <Activity size={20} /> },
  ];

  // Filter links based on user roles
  const navLinks = allNavLinks.filter(link => {
    // If no role restriction, show to everyone
    if (!link.allowedRoles) return true;
    
    // Check if any of the user's roles match any of the allowed roles
    return link.allowedRoles.some(allowedRole => 
      userRoles.some(userRole => userRole === allowedRole)
    );
  });

  // Access the logo URL from the Vite environment variable
  const logo = import.meta.env.VITE_LOGO;

  const handleLogout = () => {
    // Use the tokenHandler to destroy all tokens from cookies
    tokenHandler.clearAllTokens();
    // Then call the logout function from AuthContext to update app state
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
                    ? 'bg-gray-100 text-black' // Active link style
                    : 'text-black hover:bg-gray-50' // Inactive link style - now black
                }`
              }
            >
              <span className="mr-3 text-black">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Profile Option with Dropdown */}
      <div className="mt-auto px-2 py-4 mb-4">
        <div className="relative">
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-50"
          >
            <CircleUserRound size={20} className="mr-3 text-black" />
            <span>Profile</span>
          </button>
          
          {profileDropdownOpen && (
            <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mb-1">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                <User size={18} className="mr-3 text-black" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                <LogOut size={18} className="mr-3 text-black" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;