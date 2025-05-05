import React, { useState, useEffect } from 'react';
import { ExternalLink, Pencil, X, FileText } from 'lucide-react';
import AircraftSelector from './AircraftSelector';
import SkeletonLoader from './SkeletonLoader';
import { AircraftService } from '../../api/aircraft/AircraftService';
import { tokenHandler } from '../../utils/tokenHandler';

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
  loading: initialLoading = false, 
  conversationId,
  onUpdate,
  sellerCompanyId
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [aircraftList, setAircraftList] = useState([]);
  const [loadingAircraftList, setLoadingAircraftList] = useState(false);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

    // Add direct console log to check if component is rendering
    // console.log('AircraftDetails component rendered');
    // console.log('Token exists:', !!tokenHandler.getToken());
    // console.log('Seller Company ID:', sellerCompanyId);
    
    // if (tokenHandler.getToken()) {
    //   const userData = tokenHandler.parseUserFromToken(tokenHandler.getToken());
    //   console.log('User data from token:', userData);
    //   console.log('User Company ID:', userData?.comId);
    // }

  // Fetch aircraft list when component mounts
  useEffect(() => {
    const fetchAircraftList = async () => {
      try {
        setLoadingAircraftList(true);
        const data = await AircraftService.getAllAircraft(sellerCompanyId);
        setAircraftList(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching aircraft:', err);
        setError('Failed to load aircraft. Please try again.');
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

  const handleUpdateSuccess = async (updatedAircraftData) => {
    try {
      setLoading(true);
      if (updatedAircraftData) {
        // Use the already fetched data if provided
        if (onUpdate) {
          onUpdate(updatedAircraftData); // Notify parent of update
        }
        aircraft = updatedAircraftData;
      } else {
        // Fallback to fetching all aircraft if no data provided
        const updatedAircraft = await AircraftService.getAllAircraft();
        // Get the latest selected aircraft data
        const latestAircraft = updatedAircraft.find(a => a.id === selectedAircraft?.id);
        if (latestAircraft) {
          if (onUpdate) {
            onUpdate(latestAircraft); // Notify parent of update
          }
          aircraft = latestAircraft; // Update the current aircraft data
        }
        setAircraftList(updatedAircraft);
      }
      setShowSelector(false);
      setSelectedAircraft(null);
    } catch (err) {
      console.error('Error updating aircraft:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use selected aircraft if available, otherwise use formatted API data
  const currentAircraft = selectedAircraft || formatAircraftData(aircraft);

  useEffect(() => {
    // Reset loading state when aircraft data changes
    if (aircraft) {
      setLoading(false);
    }
  }, [aircraft]);

  const handleEdit = () => {
    setShowSelector(true);
  };

  const handleCloseSelector = () => {
    setShowSelector(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[450px] w-[500px] max-w-full">
      {/* Header with Aircraft title and edit icon */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Aircraft</h2>
          {!loading && sellerCompanyId && tokenHandler.getToken() && 
           String(tokenHandler.parseUserFromToken(tokenHandler.getToken())?.comId) === String(sellerCompanyId) && (
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
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <AircraftDetailsSkeleton />
        ) : !currentAircraft ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-black">No aircraft data available</p>
          </div>
        ) : (
          <>
            {/* Aircraft Selector */}
            {showSelector && (
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
                />
              </div>
            )}

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
        )}
      </div>
    </div>
  );
};

export default AircraftDetails; 