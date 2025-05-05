import { tokenHandler } from '../../utils/tokenHandler';
import appConfig from '../../config/appConfig';
import api from '../axios.config';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_ACS_VAPID_PUBLIC_KEY;
const REGISTRATION_CACHE_KEY = 'push_notification_registration';
const CACHE_EXPIRY = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds


class PushNotificationService {
  constructor() {
    this.isRegistering = false;
    this.debug = import.meta.env.MODE === 'development';
  }

  generateDeviceId() {
    // Generate a shorter, unique device ID using timestamp and random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `web_${timestamp}_${randomStr}`;
  }

  getDeviceModel() {
    const userAgent = navigator.userAgent;
    // Extract browser name and version
    let browser = "Unknown";
    
    // Check Edge first since it includes Chrome in user agent
    if (userAgent.includes("Edg/")) {
      browser = "Edge" + userAgent.match(/Edg\/([0-9.]+)/)[1].split('.')[0];
    } else if (userAgent.includes("Chrome")) {
      browser = "Chrome" + userAgent.match(/Chrome\/([0-9.]+)/)[1].split('.')[0];
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox" + userAgent.match(/Firefox\/([0-9.]+)/)[1].split('.')[0];
    } else if (userAgent.includes("Safari")) {
      browser = "Safari" + userAgent.match(/Version\/([0-9.]+)/)[1].split('.')[0];
    }
    return browser;
  }

  clearRegistrationCache() {
    localStorage.removeItem(REGISTRATION_CACHE_KEY);
    if (this.debug) console.log('Registration cache cleared');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Ensure the service worker is registered from the root path
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        
        // Wait for the service worker to be active
        if (registration.installing) {
          await new Promise(resolve => {
            registration.installing.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                resolve();
              }
            });
          });
        }
        
        // Send configuration to service worker
        if (registration.active) {
          registration.active.postMessage({
            type: 'CONFIG_UPDATE',
            config: {
              appName: appConfig.name,
              notificationIcon: appConfig.notificationIcon,
              notificationBadge: appConfig.notificationBadge
            }
          });
        }
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker not supported in this browser');
  }

  async getSubscription(swRegistration) {
    try {
      let subscription = await swRegistration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }
      return subscription;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isRegistrationValid(cachedData) {
    if (!cachedData) return false;
    
    const now = Date.now();
    const isExpired = now - cachedData.timestamp > CACHE_EXPIRY;
    const hasValidToken = tokenHandler.getToken() === cachedData.token;
    
    // if (this.debug) {
    //   console.log('Cache validation:', {
    //     isExpired,
    //     timeSinceLastRegistration: Math.round((now - cachedData.timestamp) / 1000 / 60) + ' minutes',
    //     hasValidToken,
    //     cachedToken: cachedData.token?.substring(0, 10) + '...',
    //     currentToken: tokenHandler.getToken()?.substring(0, 10) + '...'
    //   });
    // }

    // In development, force registration every hour
    // if (this.debug && isExpired) {
    //   console.log('Cache expired, forcing new registration');
    //   return false;
    // }
    
    return !isExpired && hasValidToken;
  }

  async registerDevice(subscription) {
    // Prevent concurrent registrations
    if (this.isRegistering) {
      return { status: 'skipped', message: 'Registration already in progress' };
    }

    try {
      this.isRegistering = true;

      // Check cache first
      const cachedRegistration = JSON.parse(localStorage.getItem(REGISTRATION_CACHE_KEY) || 'null');
      
      // Force new registration if endpoint changed
      if (cachedRegistration?.payload?.pushSubscription?.endpoint !== subscription.endpoint) {
        if (this.debug) console.log('Subscription endpoint changed, forcing new registration');
        this.clearRegistrationCache();
      }
      
      if (this.isRegistrationValid(cachedRegistration)) {
        // if (this.debug) console.log('Using cached registration:', cachedRegistration.payload);
        return { status: 'cached', message: 'Using cached registration' }; // Return status object for cached registrations
      }

      const userData = tokenHandler.parseUserFromToken(tokenHandler.getToken());
      if (!userData?.id) {
        throw new Error('User ID not found in token');
      }

      const payload = {
        userId: userData.id,
        deviceId: this.generateDeviceId(),
        deviceModel: this.getDeviceModel(),
        osVersion: navigator.platform.split(' ')[0],
        appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        platform: 'web',
        pushSubscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, 
              new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, 
              new Uint8Array(subscription.getKey('auth'))))
          }
        }
      };

      if (this.debug) console.log('Registering device with payload:', payload);

      const { data } = await api.post('/api/Global/RegisterDevice', payload);
      
      // Cache successful registration
      localStorage.setItem(REGISTRATION_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        token: tokenHandler.getToken(),
        payload
      }));

      if (this.debug) console.log('Registration successful:', data);

      return { ...data, status: 'registered' };
    } catch (error) {
      console.error('Failed to register device:', error);
      // Clear cache on error to allow retry
      this.clearRegistrationCache();
      throw error.message || 'Failed to register device';
    } finally {
      this.isRegistering = false;
    }
  }
}


export const pushNotificationService = new PushNotificationService(); 






// import { tokenHandler } from '../../utils/tokenHandler';
// import appConfig from '../../config/appConfig';

// const VAPID_PUBLIC_KEY = import.meta.env.VITE_ACS_VAPID_PUBLIC_KEY;
// const REGISTRATION_CACHE_KEY = 'push_notification_registration';
// const CACHE_EXPIRY = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds


// class PushNotificationService {
//   constructor() {
//     this.isRegistering = false;
//     this.debug = import.meta.env.MODE === 'development';
//   }

//   generateDeviceId() {
//     // Generate a shorter, unique device ID using timestamp and random string
//     const timestamp = Date.now().toString(36);
//     const randomStr = Math.random().toString(36).substring(2, 8);
//     return `web_${timestamp}_${randomStr}`;
//   }

//   getDeviceModel() {
//     const userAgent = navigator.userAgent;
//     // Extract browser name and version
//     let browser = "Unknown";
    
//     // Check Edge first since it includes Chrome in user agent
//     if (userAgent.includes("Edg/")) {
//       browser = "Edge" + userAgent.match(/Edg\/([0-9.]+)/)[1].split('.')[0];
//     } else if (userAgent.includes("Chrome")) {
//       browser = "Chrome" + userAgent.match(/Chrome\/([0-9.]+)/)[1].split('.')[0];
//     } else if (userAgent.includes("Firefox")) {
//       browser = "Firefox" + userAgent.match(/Firefox\/([0-9.]+)/)[1].split('.')[0];
//     } else if (userAgent.includes("Safari")) {
//       browser = "Safari" + userAgent.match(/Version\/([0-9.]+)/)[1].split('.')[0];
//     }
//     return browser;
//   }

//   clearRegistrationCache() {
//     localStorage.removeItem(REGISTRATION_CACHE_KEY);
//   }

//   async registerServiceWorker() {
//     if ('serviceWorker' in navigator) {
//       try {
//         // Ensure the service worker is registered from the root path
//         const registration = await navigator.serviceWorker.register('/service-worker.js', {
//           scope: '/'
//         });
        
//         // Wait for the service worker to be active
//         if (registration.installing) {
//           await new Promise(resolve => {
//             registration.installing.addEventListener('statechange', (e) => {
//               if (e.target.state === 'activated') {
//                 resolve();
//               }
//             });
//           });
//         }
        
//         // Send configuration to service worker
//         if (registration.active) {
//           registration.active.postMessage({
//             type: 'CONFIG_UPDATE',
//             config: {
//               appName: appConfig.name,
//               notificationIcon: appConfig.notificationIcon,
//               notificationBadge: appConfig.notificationBadge
//             }
//           });
//         }
        
//         return registration;
//       } catch (error) {
//         console.error('Service Worker registration failed:', error);
//         throw error;
//       }
//     }
//     throw new Error('Service Worker not supported in this browser');
//   }

//   async getSubscription(swRegistration) {
//     try {
//       let subscription = await swRegistration.pushManager.getSubscription();
//       if (!subscription) {
//         subscription = await swRegistration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
//         });
//       }
//       return subscription;
//     } catch (error) {
//       console.error('Failed to get push subscription:', error);
//       throw error;
//     }
//   }

//   urlBase64ToUint8Array(base64String) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');

//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);

//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
//   }

//   isRegistrationValid(cachedData) {
//     if (!cachedData) return false;
    
//     const now = Date.now();
//     const isExpired = now - cachedData.timestamp > CACHE_EXPIRY;
//     const hasValidToken = tokenHandler.getToken() === cachedData.token;
    
//     if (this.debug) {
//       console.log('Cache validation:', {
//         isExpired,
//         timeSinceLastRegistration: Math.round((now - cachedData.timestamp) / 1000 / 60) + ' minutes',
//         hasValidToken,
//         cachedToken: cachedData.token?.substring(0, 10) + '...',
//         currentToken: tokenHandler.getToken()?.substring(0, 10) + '...'
//       });
//     }

//     // In development, force registration every hour
//     if (this.debug && isExpired) {
//       console.log('Cache expired, forcing new registration');
//       return false;
//     }
    
//     return !isExpired && hasValidToken;
//   }

//   async registerDevice(subscription) {
//     // Prevent concurrent registrations
//     if (this.isRegistering) {
//       return { status: 'skipped', message: 'Registration already in progress' };
//     }

//     try {
//       this.isRegistering = true;

//       // Check cache first
//       const cachedRegistration = JSON.parse(localStorage.getItem(REGISTRATION_CACHE_KEY) || 'null');
      
//       // Force new registration if endpoint changed
//       if (cachedRegistration?.payload?.pushSubscription?.endpoint !== subscription.endpoint) {
//         if (this.debug) console.log('Subscription endpoint changed, forcing new registration');
//         this.clearRegistrationCache();
//       }
      
//       if (this.isRegistrationValid(cachedRegistration)) {
//         if (this.debug) console.log('Using cached registration:', cachedRegistration.payload);
//         return { status: 'cached', message: 'Using cached registration' }; // Return status object for cached registrations
//       }

//       const userData = tokenHandler.parseUserFromToken(tokenHandler.getToken());
//       if (!userData?.id) {
//         throw new Error('User ID not found in token');
//       }

//       const payload = {
//         userId: userData.id,
//         deviceId: this.generateDeviceId(),
//         deviceModel: this.getDeviceModel(),
//         osVersion: navigator.platform.split(' ')[0],
//         appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
//         platform: 'web',
//         pushSubscription: {
//           endpoint: subscription.endpoint,
//           keys: {
//             p256dh: btoa(String.fromCharCode.apply(null, 
//               new Uint8Array(subscription.getKey('p256dh')))),
//             auth: btoa(String.fromCharCode.apply(null, 
//               new Uint8Array(subscription.getKey('auth'))))
//           }
//         }
//       };

//       if (this.debug) console.log('Registering device with payload:', payload);

//       const response = await fetch('https://7fa4-2409-40e3-6b-a584-5873-ef96-bf3a-3773.ngrok-free.app/api/Global/RegisterDevice', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Api-Key': 'instacharter@2025'
//         },
//         body: JSON.stringify(payload)
//       });
      
//       const data = await response.json();
      
//       // Cache successful registration
//       localStorage.setItem(REGISTRATION_CACHE_KEY, JSON.stringify({
//         timestamp: Date.now(),
//         token: tokenHandler.getToken(),
//         payload
//       }));

//       if (this.debug) console.log('Registration successful:', data);

//       return { ...data, status: 'registered' };
//     } catch (error) {
//       console.error('Failed to register device:', error);
//       // Clear cache on error to allow retry
//       this.clearRegistrationCache();
//       throw error.message || 'Failed to register device';
//     } finally {
//       this.isRegistering = false;
//     }
//   }
// }

// export const pushNotificationService = new PushNotificationService(); 