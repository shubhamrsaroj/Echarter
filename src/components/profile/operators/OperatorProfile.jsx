import React, { useState, useEffect, useRef } from 'react';
import FlightSearch from './search/FlightSearch';
import CompanyHeader from './company/CompanyHeader';
import AircraftList from './aircraft/AircraftList';
import ScheduleList from './schedule/ScheduleList';
import ReviewList from './reviews/ReviewList';
import NewsList from './news/NewsList';
import FleetList from './fleet/FleetList';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Add cache-busting functionality
const addCacheBuster = () => {
  // Only run in browser environment
  if (typeof document !== 'undefined') {
    // Force reload without cache
    const reloadWithoutCache = () => {
      console.log('Forcing page reload without cache...');
      window.location.reload(true);
    };
    
    // Add meta tags to prevent caching
    const meta1 = document.createElement('meta');
    meta1.httpEquiv = 'Cache-Control';
    meta1.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta1);
    
    const meta2 = document.createElement('meta');
    meta2.httpEquiv = 'Pragma';
    meta2.content = 'no-cache';
    document.head.appendChild(meta2);
    
    const meta3 = document.createElement('meta');
    meta3.httpEquiv = 'Expires';
    meta3.content = '0';
    document.head.appendChild(meta3);
    
    // Register service worker for widget
    if ('serviceWorker' in navigator && window.location.hostname.includes('widget')) {
      navigator.serviceWorker.register('/widget-service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check if there's an update and activate it
          registration.update();
          
          // If there's a waiting worker, activate it
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          
          // Clear cache
          navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    // Check if we're in widget mode and if this is the first load
    if (window.location.hostname.includes('widget') && !sessionStorage.getItem('widgetLoaded')) {
      // Set flag to prevent infinite reload
      sessionStorage.setItem('widgetLoaded', 'true');
      
      // Add timestamp to URL to bust cache
      const timestamp = new Date().getTime();
      const url = new URL(window.location.href);
      url.searchParams.set('_t', timestamp);
      
      // Replace current URL with timestamped one
      window.history.replaceState({}, document.title, url.toString());
      
      // Force reload after a short delay
      setTimeout(reloadWithoutCache, 100);
    }
  }
};

// Sample data for demonstration
const sampleData = {
  company: {
    name: 'Company Name',
    logo: '',
    city: 'City',
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://example.com',
    role: 'Seller',
    description: 'Leading charter company with exceptional service and modern fleet.'
  },
  aircraft: [
    { id: 1, type: 'Midsize', tailNumber: 'N123AB', seats: 6, image: '' },
    { id: 2, type: 'Tail', tailNumber: 'N456CD', seats: 8, image: '' },
    { id: 3, type: 'Tail', tailNumber: 'N789EF', seats: 4, image: '' }
  ],
  schedules: [
    { 
      id: 1, 
      departure: 'Fort Lauderdale', 
      arrival: 'Denver', 
      date: '21 Jun 25', 
      passengers: 6,
      aircraftType: 'Midsize'
    }
  ],
  reviews: [],
  articles: [
    { 
      id: 1, 
      title: 'Card Title', 
      subtitle: 'Card Subtitle', 
      content: 'Molevtie tellus sit venenatis morbi eget aenean massa diam lorem. Id sit aliquam lacus mauris sed a sit enim in. Lacus egestas nulla est facilisi quam etiam id.',
      image: 'https://via.placeholder.com/800x400'
    },
    { 
      id: 2, 
      title: 'Card Title', 
      subtitle: 'Card Subtitle', 
      content: 'Molevtie tellus sit venenatis morbi eget aenean massa diam lorem. Id sit aliquam lacus mauris sed a sit enim in. Lacus egestas nulla est facilisi quam etiam id.',
      image: 'https://via.placeholder.com/800x400'
    },
    { 
      id: 3, 
      title: 'Card Title', 
      subtitle: 'Card Subtitle', 
      content: 'Molevtie tellus sit venenatis morbi eget aenean massa diam lorem. Id sit aliquam lacus mauris sed a sit enim in. Lacus egestas nulla est facilisi quam etiam id.',
      image: 'https://via.placeholder.com/800x400'
    }
  ]
};

// Sample company data for specific company IDs
const companyData = {
  '2757': {
    name: 'InstaCharter Aviation',
    logo: 'https://via.placeholder.com/200x200?text=InstaCharter',
    city: 'Miami, FL',
    email: 'info@instacharter.app',
    phone: '+1 (305) 555-1234',
    website: 'https://instacharter.app',
    role: 'Operator',
    headline: 'Premium private jet charter service with a modern fleet and exceptional customer service.',
    rankOverall: '95'
  },
  '1921': {
    name: 'SkyWay Charter',
    logo: 'https://via.placeholder.com/200x200?text=SkyWay',
    city: 'Los Angeles, CA',
    email: 'contact@skywayexample.com',
    phone: '+1 (213) 555-6789',
    website: 'https://skywayexample.com',
    role: 'Operator',
    headline: 'Luxury private jet charter with personalized service and global reach.',
    rankOverall: '92'
  }
};

const OperatorProfile = ({ operatorId: propOperatorId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const proxyIframeRef = useRef(null);
  const pendingRequestsRef = useRef({});
  const proxyReadyRef = useRef(false);
  const location = useLocation();
  
  // Setup proxy iframe for CORS workaround
  useEffect(() => {
    // Only setup proxy in widget mode
    if (!window.location.hostname.includes('widget')) {
      return;
    }
    
    // Create hidden iframe for proxy
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = '/proxy.html';
    document.body.appendChild(iframe);
    proxyIframeRef.current = iframe;
    
    // Listen for messages from proxy
    const handleMessage = (event) => {
      // Verify sender origin for security
      if (event.source !== iframe.contentWindow) {
        return;
      }
      
      const data = event.data;
      
      // Handle proxy ready message
      if (data.type === 'proxyReady') {
        console.log('Proxy iframe is ready');
        proxyReadyRef.current = true;
      }
      
      // Handle company data response
      if (data.type === 'companyData' && data.requestId) {
        const request = pendingRequestsRef.current[data.requestId];
        if (request) {
          console.log('Received company data from proxy:', data.data);
          request.resolve(data.data);
          delete pendingRequestsRef.current[data.requestId];
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, []);
  
  // Function to fetch data through proxy
  const fetchViaProxy = async (companyId) => {
    return new Promise((resolve, reject) => {
      if (!proxyIframeRef.current || !proxyReadyRef.current) {
        console.log('Proxy not ready, falling back to direct API call');
        reject(new Error('Proxy not ready'));
        return;
      }
      
      // Create request ID
      const requestId = Date.now().toString();
      
      // Store promise callbacks
      pendingRequestsRef.current[requestId] = { resolve, reject };
      
      // Send request to proxy
      proxyIframeRef.current.contentWindow.postMessage({
        type: 'fetchCompany',
        requestId,
        companyId
      }, '*');
      
      // Set timeout to prevent hanging requests
      setTimeout(() => {
        if (pendingRequestsRef.current[requestId]) {
          console.log('Proxy request timed out');
          reject(new Error('Request timed out'));
          delete pendingRequestsRef.current[requestId];
        }
      }, 5000);
    });
  };
  
  // Run cache busting on component mount
  useEffect(() => {
    addCacheBuster();
  }, []);
  
  // Parse URL parameters for widget functionality
  const queryParams = new URLSearchParams(location.search);
  const companyId = queryParams.get('companyid') || propOperatorId;
  
  // Log all URL parameters
  console.log('URL search params:', location.search);
  console.log('All URL parameters:');
  for (const [key, value] of queryParams.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  // Log user agent and environment info for debugging
  console.log('User Agent:', navigator.userAgent);
  console.log('Window Location:', window.location.href);
  console.log('Window Hostname:', window.location.hostname);
  
  // Widget display flags - Check if we're on widget.instacharter.app or if companyid is in URL
  const isWidget = window.location.hostname.includes('widget.instacharter.app') || 
                   (window.location.hostname.includes('widget') && window.location.hostname.includes('instacharter')) || 
                   queryParams.has('companyid');
  
  // If no specific sections are specified in widget mode, show all sections by default
  const hasAnySectionParam = ['reviews', 'news', 'quote', 'fleet', 'empty'].some(param => 
    queryParams.has(param)
  );
  
  // Force reviews to true for company ID 1921
  const showReviews = companyId === '1921' || companyId === 1921 ? true : 
    (isWidget ? (hasAnySectionParam ? queryParams.get('reviews') === 'true' : true) : true);
  const showNews = isWidget ? (hasAnySectionParam ? queryParams.get('news') === 'true' : true) : true;
  const showQuote = isWidget ? (hasAnySectionParam ? queryParams.get('quote') === 'true' : true) : true;
  const showFleet = isWidget ? (hasAnySectionParam ? queryParams.get('fleet') === 'true' : true) : true;
  const showEmpty = isWidget ? queryParams.get('empty') === 'true' : false;
  
  console.log('Widget parameters:', {
    hostname: window.location.hostname,
    isWidget,
    companyId,
    showReviews,
    showNews,
    showQuote,
    showFleet
  });
  
  // Generate shareable widget link
  const generateWidgetLink = (sections = {}) => {
    const baseUrl = 'https://widget.instacharter.app';
    const params = new URLSearchParams();
    
    // Always include company ID
    params.append('companyid', companyId || '2757');
    
    // Add selected sections
    if (sections.reviews) params.append('reviews', 'true');
    if (sections.news) params.append('news', 'true');
    if (sections.quote) params.append('quote', 'true');
    if (sections.fleet) params.append('fleet', 'true');
    if (sections.empty) params.append('empty', 'true');
    
    return `${baseUrl}?${params.toString()}`;
  };
  
  // Fetch reviews from API
  const fetchReviews = async (companyId) => {
    try {
      console.log('Fetching reviews for company ID:', companyId);
      
      // For company ID 2757 or 1921, always return sample data for demonstration
      if (companyId === '2757' || companyId === 2757 || companyId === '1921' || companyId === 1921) {
        console.log('Using sample reviews data for company', companyId);
        return [
          { 
            id: 1, 
            name: 'John Smith', 
            rating: 4.5, 
            role: 'Traveller', 
            text: 'Excellent service! The aircraft was immaculate and the crew was professional and attentive.' 
          },
          { 
            id: 2, 
            name: 'Jane Doe', 
            rating: 5, 
            role: 'Broker', 
            text: 'Very reliable operator. Always responsive and accommodating to client needs.' 
          },
          { 
            id: 3, 
            name: 'Robert Johnson', 
            rating: 4, 
            role: 'Traveller', 
            text: 'Great experience overall. Would definitely fly with them again.' 
          }
        ];
      }
      
      // Try without token, only with X-Api-Key
      try {
        console.log('Attempting to fetch reviews without token');
        const response = await axios.get(
          `https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/GetReviews`, 
          {
            params: {
              IsFor: true,
              CompanyId: companyId,
              UserId: '3ac62718-045f-4fa3-a033-69651192b8d7' // Default user ID
            },
            headers: {
              'X-Api-Key': 'instacharter@2025',
              'accept': 'text/plain'
            }
          }
        );
        
        if (response.data && response.data.success) {
          console.log('Reviews fetched without token:', response.data.data);
          return response.data.data || [];
        } else {
          console.error('Failed to fetch reviews without token:', response.data);
          return []; // Return empty array if API call fails
        }
      } catch (noTokenError) {
        console.log('Error fetching reviews without token:', noTokenError);
        return []; // Return empty array if API call fails
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };
  
  // Simulate API call to fetch operator data
  useEffect(() => {
    // In a real app, you would fetch data from an API
    const fetchData = async () => {
      try {
        console.log('OperatorProfile useEffect running, companyId:', companyId, 'showReviews:', showReviews);
        console.log('Is widget mode:', isWidget);
        console.log('Device info:', navigator.userAgent);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use company-specific data if available, otherwise use sample data
        let companySpecificData = { ...sampleData };
        
        // IMPORTANT: For widget.instacharter.app, ensure we always use sample data first to avoid blank display
        if (isWidget) {
          console.log('Widget mode detected, using sample data first to avoid blank display');
          
          // Set sample data for widget to prevent blank display
          if (companyId === '1921' || companyId === 1921) {
            console.log('Using hardcoded data for company 1921 in widget mode');
            companySpecificData.company = {
              name: 'Insta Charter',
              logo: 'https://blobcntainerinstacharter.blob.core.windows.net/instacharter-az-0125-container/Instacharter_Images/UserCompanyProfileLogo/61b67c68-0f5a-4aeb-8102-4eb04450f279.webp',
              city: 'Noida, UP',
              email: 'contact@instacharter.app',
              phone: '+91 1234567890',
              website: 'https://instacharter.app',
              role: 'Broker',
              headline: 'Premium private jet charter service with a modern fleet and exceptional customer service.',
              rankOverall: '95',
              certificates: [
                { id: 1, name: 'Wyvern', logo: 'https://blobcntainerinstacharter.blob.core.windows.net/instacharter-az-0125-container/Easycharter/certifications/WyvernWingman.png' },
                { id: 2, name: 'Argus', logo: 'https://blobcntainerinstacharter.blob.core.windows.net/instacharter-az-0125-container/Easycharter/certifications/ArgusGold.png' }
              ]
            };
          }
            
          // Set data immediately with sample data to prevent blank display
            setData(companySpecificData);
            setLoading(false);
            
            // Add sample reviews for demonstration
          const sampleReviews = [
              { 
                id: 1, 
                name: 'John Smith', 
                rating: 4.5, 
                role: 'Traveller', 
                text: 'Excellent service! The aircraft was immaculate and the crew was professional and attentive.' 
              },
              { 
                id: 2, 
                name: 'Jane Doe', 
                rating: 5, 
                role: 'Broker', 
                text: 'Very reliable operator. Always responsive and accommodating to client needs.' 
              },
              { 
                id: 3, 
                name: 'Robert Johnson', 
                rating: 4, 
                role: 'Traveller', 
                text: 'Great experience overall. Would definitely fly with them again.' 
              }
          ];
          setReviews(sampleReviews);
            
          // If companyId is specified, try to fetch real data in the background
          if (companyId) {
            // Try to fetch real company data in the background
            fetchRealCompanyData(companyId).then(realData => {
              if (realData) {
                console.log('Real company data fetched successfully:', realData);
                setData(prevData => ({
                  ...prevData,
                  company: realData
                }));
              }
            }).catch(error => {
              console.error('Error fetching real company data:', error);
              // Keep using sample data if real data fetch fails
            });
            
            // Also fetch real reviews in the background
            fetchReviews(companyId).then(realReviews => {
              if (realReviews && realReviews.length > 0) {
                console.log('Real reviews fetched successfully:', realReviews);
                setReviews(realReviews);
              }
            }).catch(error => {
              console.error('Error fetching real reviews:', error);
            });
          }
        } else {
        // Try to fetch real company data from API
        try {
          console.log('Attempting to fetch company data in useEffect without token');
          
            // Try with X-Api-Key only
            const response = await axios.get(
              `https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/GetCompaniesById`, 
              {
                params: {
                  Id: companyId
                },
                headers: {
                  'X-Api-Key': 'instacharter@2025',
                  'accept': 'text/plain'
                }
              }
            );
            
            if (response.data && response.data.success) {
              console.log('Company data fetched from API without token:', response.data.data);
            
            // Map API response to our company format
            const apiCompany = response.data.data;
            companySpecificData.company = {
              name: apiCompany.name || 'Company Name',
              logo: apiCompany.logo && apiCompany.logo.length > 0 ? apiCompany.logo[0] : '',
              city: `${apiCompany.city || ''}, ${apiCompany.state || ''}`,
              email: apiCompany.email || null,
              phone: apiCompany.phone || null,
              website: apiCompany.street || null,  // API uses 'street' for website
              role: apiCompany.roles || 'Operator',
              headline: apiCompany.hedline || apiCompany.description || 'Leading charter company with exceptional service and modern fleet.',
              rankOverall: apiCompany.rankOverall || null,
              certificates: apiCompany.certificates || []
            };
          } else {
            console.error('Failed to fetch company data:', response.data);
            // Fall back to sample data if API fails
            if (companyData[companyId]) {
              companySpecificData.company = companyData[companyId];
              console.log(`Using sample data for company ID: ${companyId}`);
            }
          }
        } catch (error) {
          console.error('Error fetching company data:', error);
          // Fall back to sample data if API fails
          if (companyData[companyId]) {
            companySpecificData.company = companyData[companyId];
            console.log(`Using sample data for company ID: ${companyId}`);
            }
          }
        }
        
        setData(companySpecificData);
        
        // Fetch reviews
        if (showReviews && companyId) {
          console.log('Fetching reviews in useEffect for company:', companyId);
          const reviewsData = await fetchReviews(companyId);
          console.log('Reviews data received:', reviewsData);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error fetching operator data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, showReviews]);
  
  // Helper function to fetch real company data
  const fetchRealCompanyData = async (companyId) => {
    try {
      console.log('Attempting to fetch company data without token');
      
      // Try without token, only with X-Api-Key
      try {
        const response = await axios.get(
          `https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/GetCompaniesById`, 
          {
            params: {
              Id: companyId
            },
            headers: {
              'X-Api-Key': 'instacharter@2025',
              'accept': 'text/plain'
            }
          }
        );
        
        if (response.data && response.data.success) {
          console.log('Company data fetched from API without token:', response.data.data);
          
          // Map API response to our company format
          const apiCompany = response.data.data;
          return {
            name: apiCompany.name || 'Company Name',
            logo: apiCompany.logo && apiCompany.logo.length > 0 ? apiCompany.logo[0] : '',
            city: `${apiCompany.city || ''}, ${apiCompany.state || ''}`,
            email: apiCompany.email || null,
            phone: apiCompany.phone || null,
            website: apiCompany.street || null,  // API uses 'street' for website
            role: apiCompany.roles || 'Operator',
            headline: apiCompany.hedline || apiCompany.description || 'Leading charter company with exceptional service and modern fleet.',
            rankOverall: apiCompany.rankOverall || null,
            certificates: apiCompany.certificates || []
          };
        } else {
          console.error('Failed to fetch company data without token:', response.data);
        }
      } catch (noTokenError) {
        console.log('Error fetching without token:', noTokenError);
      }
      
      // If we reach here, the no-token approach failed
      console.log('No-token approach failed, falling back to sample data');
          
      // Return sample data for the company ID if available
      if (companyData[companyId]) {
        console.log(`Using sample data for company ID: ${companyId}`);
        return companyData[companyId];
      }
      
      // If no sample data for this company ID, return null
      return null;
    } catch (error) {
      console.error('Error in fetchRealCompanyData:', error);
      return null;
    }
  };
  
  const handleSearch = (searchParams) => {
    console.log('Search params:', searchParams);
    // In a real app, you would perform a search with these parameters
  };
  
  const handleQuoteRequest = (aircraft) => {
    console.log('Quote requested for aircraft:', aircraft);
    // In a real app, you would handle the quote request
  };
  
  const handleBookClick = (schedule) => {
    console.log('Booking requested for schedule:', schedule);
    // In a real app, you would handle the booking request
  };
  
  // Widget embed code generator
  const getEmbedCode = () => {
    const widgetUrl = generateWidgetLink({
      reviews: showReviews,
      news: showNews,
      quote: showQuote,
      fleet: showFleet,
      empty: showEmpty
    });
    
    // Make sure widgetUrl has the correct protocol
    const fullWidgetUrl = widgetUrl.startsWith('http') ? widgetUrl : `https://${widgetUrl}`;
    
    return `<iframe src="${fullWidgetUrl}" width="100%" height="600" frameborder="0" title="InstaCharter Widget"></iframe>`;
  };
  
  // Apply widget styling if in widget mode
  const containerClass = isWidget 
    ? "widget-container bg-white shadow-sm rounded-lg overflow-hidden" 
    : "min-h-screen bg-gray-50";
  
  const contentClass = isWidget
    ? "p-3 md:p-4"
    : "container mx-auto py-4 md:py-8 px-3 md:px-4";
    
  // Special styling for reviews in widget mode
  const reviewsClass = isWidget
    ? "mt-3 md:mt-4 mb-6 md:mb-8 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100"
    : "mt-3 md:mt-4 mb-6 md:mb-8";
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6">
          <i className="pi pi-spin pi-spinner text-blue-500 text-4xl"></i>
          <p className="mt-2 text-gray-600">Loading operator profile...</p>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6">
          <i className="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
          <p className="mt-2 text-gray-600">Failed to load operator profile.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Company Header - Always show */}
        <CompanyHeader company={data.company} companyId={companyId} />
        
        {/* Reviews - Show prominently in widget mode */}
        {showReviews && (
          <div className={reviewsClass}>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Customer Reviews</h2>
            <ReviewList reviews={reviews} />
          </div>
        )}
        
        {/* Get a Quote Section */}
        {showQuote && <FlightSearch onSearch={handleSearch} />}
        
        {/* Fleet List */}
        {showFleet && <FleetList companyId={companyId} />}
        
        {/* Aircraft List - Part of the quote section */}
        {showQuote && (
          <AircraftList 
            aircraft={data.aircraft} 
            onQuoteRequest={handleQuoteRequest} 
          />
        )}
        
        {/* Schedule List */}
        {showQuote && (
          <ScheduleList 
            schedules={data.schedules} 
            onBookClick={handleBookClick} 
          />
        )}
        
        {/* News List */}
        {showNews && <NewsList articles={data.articles} />}
        
        {/* Empty section for custom content */}
        {showEmpty && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Custom Content</h2>
            <p className="text-gray-600">This section can be customized with your own content.</p>
          </div>
        )}
        
        {/* Widget embed code section - Only show in full view, not in widget mode */}
        {!isWidget && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Embed This Profile</h2>
            <p className="text-gray-600 mb-4">
              Use the following code to embed this operator profile on your website:
            </p>
            <div className="bg-gray-100 p-4 rounded-md">
              <code className="text-sm break-all">{getEmbedCode()}</code>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Customize Widget</h3>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showReviews} 
                    onChange={() => {}} 
                    className="mr-2" 
                  />
                  Reviews
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showNews} 
                    onChange={() => {}} 
                    className="mr-2" 
                  />
                  News
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showQuote} 
                    onChange={() => {}} 
                    className="mr-2" 
                  />
                  Quote
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showFleet} 
                    onChange={() => {}} 
                    className="mr-2" 
                  />
                  Fleet
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showEmpty} 
                    onChange={() => {}} 
                    className="mr-2" 
                  />
                  Custom Section
                </label>
              </div>
              <div className="mt-4">
                <p className="font-semibold mb-2">Widget URL:</p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-sm break-all">{generateWidgetLink({
                    reviews: showReviews,
                    news: showNews,
                    quote: showQuote,
                    fleet: showFleet,
                    empty: showEmpty
                  })}</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorProfile; 