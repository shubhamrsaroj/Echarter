import React, { useState, useEffect } from 'react';
import { ExternalLink, Pencil, X, FileText } from 'lucide-react';
import AircraftSelector from './AircraftSelector';
import SkeletonLoader from './SkeletonLoader';
import { AircraftService } from '../../api/aircraft/AircraftService';
import { tokenHandler } from '../../utils/tokenHandler';
import { toast } from 'react-toastify';

const AircraftDetailsSkeleton = () => {
  return (
    <>
      {/* Aircraft details skeleton */}
      <div className="mb-6">
        <SkeletonLoader className="w-2/3 h-8 mb-3" />
        <SkeletonLoader className="w-1/2 h-6 mb-2" />
        <SkeletonLoader className="w-1/3 h-6 mb-2" />
        <SkeletonLoader className="w-3/4 h-6" />
      </div>

      {/* Aircraft properties skeleton */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
        <SkeletonLoader className="w-full h-6" />
        <SkeletonLoader className="w-full h-6" />
        <SkeletonLoader className="col-span-2 w-full h-6" />
        <SkeletonLoader className="col-span-2 w-full h-6" />
      </div>

      {/* Images skeleton */}
      <div className="mb-6">
        <SkeletonLoader className="w-1/4 h-6 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonLoader className="w-full h-32 rounded-lg" />
          <SkeletonLoader className="w-full h-32 rounded-lg" />
        </div>
      </div>

      {/* Documents skeleton */}
      <div>
        <SkeletonLoader className="w-1/4 h-6 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={`skeleton-document-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <SkeletonLoader className="w-1/2 h-6" />
              <div className="flex space-x-2">
                <SkeletonLoader variant="circle" width={24} height={24} />
                <SkeletonLoader variant="circle" width={24} height={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const AircraftDetails = ({ 
  aircraft, 
  onClose,
  conversationId,
  onUpdate,
  sellerCompanyId
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [aircraftList, setAircraftList] = useState([]);
  const [loadingAircraftList, setLoadingAircraftList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCompanyMatchesSeller, setUserCompanyMatchesSeller] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  // Check if user company ID matches seller company ID
  useEffect(() => {
    if (tokenHandler.getToken() && sellerCompanyId) {
      const userDataFromToken = tokenHandler.parseUserFromToken(tokenHandler.getToken());
      
      // Set match status - convert both to strings for reliable comparison
      const matches = String(userDataFromToken?.comId) === String(sellerCompanyId);
      setUserCompanyMatchesSeller(matches);
    }
  }, [sellerCompanyId]);

  // Handle loading state - two-phase approach to ensure correct sequence
  useEffect(() => {
    // Always start with loading state for at least a short period
    let dataTimer;
    let emptyStateTimer;
    
    // Phase 1: If we have aircraft data, prepare to show it after a short delay
    if (aircraft) {
      dataTimer = setTimeout(() => {
        setLoading(false); // Stop loading and show data
      }, 600);
    } 
    // Phase 2: If no aircraft data, wait longer before showing empty state
    else {
      dataTimer = setTimeout(() => {
        setLoading(false); // Stop loading first
      }, 800);
      
      emptyStateTimer = setTimeout(() => {
        setShowEmptyState(true); // Then allow empty state to show
      }, 1000);
    }
    
    // Cleanup timers on unmount
    return () => {
      clearTimeout(dataTimer);
      if (emptyStateTimer) clearTimeout(emptyStateTimer);
    };
  }, [aircraft]);

  // Fetch aircraft list when selector should be shown
  useEffect(() => {
    const fetchAircraftList = async () => {
      try {
        setLoadingAircraftList(true);
        const data = await AircraftService.getAllAircraft(sellerCompanyId);
        setAircraftList(data);
        setError(null);
      } catch (err) {
        setError('Failed to load aircraft. Please try again.');
        console.error('Error loading aircraft list:', err);
      } finally {
        setLoadingAircraftList(false);
      }
    };

    if (showSelector && sellerCompanyId) {
      fetchAircraftList();
    } else if (showSelector && !sellerCompanyId) {
      setError('Seller company ID is required to load aircraft');
    }
  }, [showSelector, sellerCompanyId]);

  // Format the API response data to match our display needs
  const formatAircraftData = (apiData) => {
    if (!apiData) return null;
    
    return {
      type: apiData.aircraft_Type_Name || '',
      registration: apiData.tail || '',
      seats: apiData.tail_Max_Pax || '',
      manufactureYear: apiData.yom || '',
      refurbishment: apiData.yor || '',
      airworthiness: apiData.airworthinessValidity || '',
      insuranceValidity: apiData.insuranceValidity || '',
      categories: apiData.categories || '',
      images: apiData.images || [],
      documents: [
        ...(apiData.privateFiles || []).map(file => ({ name: file, type: file.split('.').pop().toLowerCase() })),
        ...(apiData.publicFiles || []).map(file => ({ name: file, type: file.split('.').pop().toLowerCase() }))
      ],
      features: apiData.amenities ? apiData.amenities.reduce((acc, amenity) => ({ 
        ...acc, 
        [amenity.amenities_Name.toLowerCase()]: {
          name: amenity.amenities_Name,
          icon: amenity.icon_Url
        }
      }), {}) : {}
    };
  };

  const handleUpdateSuccess = async (updatedAircraftData, isUserCompanyUpdate = false) => {
    try {
      setLoading(true);
      
      // Skip calling parent's onUpdate if company IDs match to prevent toast
      const skipParentUpdate = isUserCompanyUpdate || userCompanyMatchesSeller;
      
      if (updatedAircraftData) {
        if (onUpdate && !skipParentUpdate) {
          // Only call parent's onUpdate if company IDs don't match
          onUpdate(updatedAircraftData);
        }
        
        // Always update our local state
        aircraft = updatedAircraftData;
        setSelectedAircraft(formatAircraftData(updatedAircraftData));
      } else {
        // Fallback to fetching all aircraft if no data provided
        const updatedAircraft = await AircraftService.getAllAircraft();
        // Get the latest selected aircraft data
        const latestAircraft = updatedAircraft.find(a => a.id === selectedAircraft?.id);
        
        if (latestAircraft) {
          if (onUpdate && !skipParentUpdate) {
            // Only call parent's onUpdate if company IDs don't match
            onUpdate(latestAircraft);
          }
          
          // Always update our local state
          aircraft = latestAircraft;
          setSelectedAircraft(formatAircraftData(latestAircraft));
        }
        
        setAircraftList(updatedAircraft);
      }
      
      // Close selector after successful update
      setShowSelector(false);
    } catch (err) {
      if (!userCompanyMatchesSeller) {
        // Only show error toast if company IDs don't match
        toast.error('Failed to update aircraft details');
        console.error('Error updating aircraft details:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use selected aircraft if available, otherwise use formatted API data
  const currentAircraft = selectedAircraft || formatAircraftData(aircraft);

  const handleEdit = () => {
    setShowSelector(true);
    
    // Ensure aircraft list is fetched if not already done
    if (aircraftList.length === 0 && !loadingAircraftList) {
      const fetchAircraftList = async () => {
        try {
          setLoadingAircraftList(true);
          const data = await AircraftService.getAllAircraft(sellerCompanyId);
          setAircraftList(data);
          setError(null);
        } catch (err) {
          setError('Failed to load aircraft. Please try again.');
          console.error('Error fetching aircraft list:', err);
        } finally {
          setLoadingAircraftList(false);
        }
      };
      
      fetchAircraftList();
    }
  };

  const handleCloseSelector = () => {
    setShowSelector(false);
  };

  // Main render function with simplified conditions
  const renderContent = () => {
    // First priority: Always show loading if loading state is true
    if (loading) {
      return <AircraftDetailsSkeleton />;
    }
    
    // Second priority: Show selector if edit button was clicked
    if (showSelector) {
      return (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select Aircraft</h3>
            <button
              onClick={handleCloseSelector}
              className="text-black hover:text-black"
              aria-label="Close selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AircraftSelector 
            onSelect={setSelectedAircraft}
            conversationId={conversationId}
            aircraftList={aircraftList}
            loading={loadingAircraftList}
            error={error}
            onUpdateSuccess={handleUpdateSuccess}
            userCompanyMatchesSeller={userCompanyMatchesSeller}
          />
        </div>
      );
    }
    
    // Third priority: Show aircraft data if available
    if (currentAircraft) {
      return (
        <>
          {/* Aircraft details */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold">{currentAircraft.type}</h3>
            <p className="text-lg font-bold mt-1">{currentAircraft.registration}</p>
            <p className="text-lg font-bold">{currentAircraft.seats} Seats</p>
            <p className="text-md text-black mt-2">Categories: <span className="font-bold">{currentAircraft.categories}</span></p>
          </div>

          {/* Aircraft properties */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
            <div>
              <span className="text-black">Manufacture Year: </span>
              <span className="font-bold">{currentAircraft.manufactureYear}</span>
            </div>
            <div>
              <span className="text-black">Refurbishment Year: </span>
              <span className="font-bold">{currentAircraft.refurbishment}</span>
            </div>
            <div className="col-span-2">
              <span className="text-black">Airworthiness validity: </span>
              <span className="font-bold">{currentAircraft.airworthiness}</span>
            </div>
            <div className="col-span-2">
              <span className="text-black">Insurance validity: </span>
              <span className="font-bold">{currentAircraft.insuranceValidity}</span>
            </div>
          </div>

          {/* Images */}
          {currentAircraft.images && currentAircraft.images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentAircraft.images.map((image, index) => (
                  <img 
                    key={`image-${index}-${image}`}
                    src={image}
                    alt={`Aircraft ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Features/Amenities */}
          {currentAircraft.features && Object.keys(currentAircraft.features).length > 0 && (
            <div className="border border-gray-300 rounded-md p-5 mb-6">
              <h3 className="font-semibold text-lg mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(currentAircraft.features).map((feature, index) => (
                  <div key={`feature-${feature.name}-${index}`} className="flex items-center space-x-2">
                    {feature.icon ? (
                      <img src={feature.icon} alt={feature.name} className="w-5 h-5" />
                    ) : (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="capitalize">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {currentAircraft.documents && currentAircraft.documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Documents</h3>
              <div className="space-y-4">
                {currentAircraft.documents.map((doc, index) => (
                  <div key={`doc-${doc.name}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="flex items-center text-black">
                      <FileText className="w-5 h-5 mr-2" />
                      {doc.name}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded-full">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    // Fourth priority: Only show empty state if explicitly allowed and loading has finished
    if (!loading && (showEmptyState || aircraft === undefined)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-lg mb-4">No aircraft selected</p>
          {sellerCompanyId && userCompanyMatchesSeller ? (
            <p className="text-gray-600">
              Please add aircraft by clicking on the pencil icon in the top left.
            </p>
          ) : (
            <p className="text-gray-600">
              No aircraft information available.
            </p>
          )}
        </div>
      );
    }
    
    // If we get here, show a mini-loader while transitioning states
    return <div className="flex justify-center items-center h-full"><div className="animate-pulse">Loading...</div></div>;
  };

  // Modify the shouldCloseComponent function to allow closing the panel
  const shouldCloseComponent = () => {
    // We always want to allow users to close the panel
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[450px] w-[500px] max-w-full">
      {/* Header with Aircraft title and edit icon */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Aircraft</h2>
          {/* Always show edit button if user company matches seller company */}
          {sellerCompanyId && userCompanyMatchesSeller && (
            <button 
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#c1ff72] hover:bg-lime-500 transition"
              aria-label="Edit aircraft"
              onClick={handleEdit}
            >
              <Pencil className="w-4 h-4 text-black" />
            </button>
          )}
        </div>
        <button
          onClick={shouldCloseComponent}
          className="p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AircraftDetails; 