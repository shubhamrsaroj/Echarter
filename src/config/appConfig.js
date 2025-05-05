const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Charter Search',
  logo: import.meta.env.VITE_LOGO || '/logo.png',
  notificationIcon: import.meta.env.VITE_NOTIFICATION_ICON || '/notification-icon.png',
  notificationBadge: import.meta.env.VITE_NOTIFICATION_BADGE || '/notification-badge.png'
};

export default appConfig; 