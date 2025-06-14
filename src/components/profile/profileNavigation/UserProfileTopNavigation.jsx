import React, { useEffect } from 'react';
import { UserProfileNavigationConfig } from './userProfileNavigationConfig';
import { TabMenu } from 'primereact/tabmenu';
import { useNavigate } from 'react-router-dom';
import { tokenHandler } from '../../../utils/tokenHandler';

const UserProfileTopNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  
  // Get user role from token
  const token = tokenHandler.getToken();
  const userData = token ? tokenHandler.parseUserFromToken(token) : null;
  const userRoles = (userData?.role || '').split(',').map(role => role.trim().toLowerCase());
  
  // Debug logging for roles
  useEffect(() => {
    console.log('Current user roles:', userRoles);
    console.log('Available tabs:', Object.keys(UserProfileNavigationConfig));
  }, [userRoles]);
  
  const items = Object.keys(UserProfileNavigationConfig).map(tab => {
    const config = UserProfileNavigationConfig[tab];
    
    // Check if this tab is role-restricted and user doesn't have the required role
    if (config.roles && !config.roles.some(role => userRoles.includes(role.toLowerCase()))) {
      console.log(`Tab ${tab} is restricted and not available to current user`);
      return null; // Skip this tab if user doesn't have the required role
    }
    
    return {
      label: tab,
      command: () => {
        if (config.external && config.path) {
          // Navigate to external path
          navigate(config.path);
        } else {
          // Use the regular tab change handler
          onTabChange(tab);
        }
      }
    };
  }).filter(Boolean); // Remove null items

  const activeIndex = Object.keys(UserProfileNavigationConfig)
    .filter(tab => {
      const config = UserProfileNavigationConfig[tab];
      if (config.roles) {
        return config.roles.some(role => userRoles.includes(role.toLowerCase()));
      }
      return true;
    })
    .findIndex(tab => tab === activeTab);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4">
        <TabMenu 
          model={items} 
          activeIndex={activeIndex >= 0 ? activeIndex : 0} 
          onTabChange={(e) => {
            const visibleTabs = Object.keys(UserProfileNavigationConfig).filter(tab => {
              const config = UserProfileNavigationConfig[tab];
              if (config.roles) {
                return config.roles.some(role => userRoles.includes(role.toLowerCase()));
              }
              return true;
            });
            
            const selectedTab = visibleTabs[e.index];
            const config = UserProfileNavigationConfig[selectedTab];
            
            if (config.external && config.path) {
              navigate(config.path);
            } else {
              onTabChange(selectedTab);
            }
          }}
          className="border-none"
        />
      </div>
    </div>
  );
};

export default UserProfileTopNavigation;
