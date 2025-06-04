import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import SearchDetailsForm from './Search/ItinerarySearch/SearchDetailsForm';
import BaseCard from './Search/ItinerarySearchDetails/BaseCard';
import MatchCard from './Search/ItinerarySearchDetails/MatchCard';
import DateAdjustment from './Search/ItinerarySearchDetails/DateAdjustment';
import RouteMap from '../common/RouteMap';
import FlightDetailsCard from '../market/Search/utils/FlightDetailsCard';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';
import RecentSearch from '../common/RecentSearch';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';

const Search = () => {
  const { 
    optionsData, 
    optionsLoading, 
    optionsError, 
    addItinerary, 
    getOptionsbyItineraryId,
    selectedItineraryId
  } = useContext(SellerMarketContext);
  
  // State for map hover functionality
  const [hoveredFlightCoords, setHoveredFlightCoords] = useState(null);
  // State for showing recent searches dialog
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  // State for active tab (now using index for TabView)
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  // State to track the selected base card category
  const [selectedBaseCategory, setSelectedBaseCategory] = useState(null);
  // State to track the hovered flight data for details card
  const [hoveredFlightData, setHoveredFlightData] = useState(null);
  // State to track aircraft tail markers on the map
  const [tailMarkers, setTailMarkers] = useState([]);
  // Timeout ref for debouncing hover state changes
  const hoverTimeoutRef = useRef(null);

  // If we have a selected itinerary ID but no options data, fetch it
  useEffect(() => {
    if (selectedItineraryId && !optionsData && !optionsLoading) {
      getOptionsbyItineraryId(selectedItineraryId);
    }
  }, [selectedItineraryId, optionsData, optionsLoading, getOptionsbyItineraryId]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleFormChange = async (formData) => {
    try {
      // Add the itinerary and get the response
      const response = await addItinerary(formData);
      
      if (response && response.itineraryId) {
        // If successful, immediately get options by itinerary ID
        await getOptionsbyItineraryId(response.itineraryId);
      }
    } catch (error) {
      console.error('Error handling form submission:', error);
    }
  };

  const toggleRecentSearches = () => {
    setShowRecentSearches(!showRecentSearches);
  };

  // Check if a tab has data
  const hasTabData = (tabName) => {
    if (!optionsData) return false;
    
    switch (tabName) {
      case 'match':
        return optionsData.match && optionsData.match.ids && optionsData.match.ids.length > 0;
      case 'dateAdjustment':
        return optionsData.dateAdjustment && optionsData.dateAdjustment.ids && optionsData.dateAdjustment.ids.length > 0;
      case 'base':
        return optionsData.base && optionsData.base.length > 0;
      default:
        return false;
    }
  };

  // Set the first available tab as active when data loads
  useEffect(() => {
    if (optionsData) {
      let idx = 0;
      if (hasTabData('match')) {
        idx = 0;
      } else if (hasTabData('dateAdjustment')) {
        idx = hasTabData('match') ? 1 : 0;
      } else if (hasTabData('base')) {
        idx = (hasTabData('match') ? 1 : 0) + (hasTabData('dateAdjustment') ? 1 : 0);
        if (optionsData.base && optionsData.base.length > 0) {
          setSelectedBaseCategory(optionsData.base[0].category);
        }
      }
      setActiveTabIndex(idx);
    }
  }, [optionsData]);

  // Update the selected base category when changing tabs
  useEffect(() => {
    if (optionsData) {
      let baseStartIdx = (hasTabData('match') ? 1 : 0) + (hasTabData('dateAdjustment') ? 1 : 0);
      if (activeTabIndex >= baseStartIdx && optionsData.base) {
        const baseIndex = activeTabIndex - baseStartIdx;
        if (optionsData.base[baseIndex]) {
          setSelectedBaseCategory(optionsData.base[baseIndex].category);
        }
      }
    }
  }, [activeTabIndex, optionsData]);

  // Clear tail markers when changing tabs
  useEffect(() => {
    setTailMarkers([]);
  }, [activeTabIndex]);

  // Handle tail info updates for displaying on the map - memoized to prevent re-renders
  const handleTailInfoUpdate = useCallback((tailInfo) => {
    setTailMarkers(tailInfo || []);
  }, []);

  // Enhanced setHoveredFlightCoords function with debounce to prevent blinking
  const handleFlightHover = (flightData) => {
    // Clear any pending timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (!flightData) {
      // Add a small delay before hiding the data to prevent flicker
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredFlightCoords(null);
        setHoveredFlightData(null);
      }, 300); // Increased delay to give more time for movement between rows
      return;
    }
    
    // Immediately set the data when hovering in
    // Set the coordinates for the map
    if (flightData.fromLat && flightData.fromLong && flightData.toLat && flightData.toLong) {
      setHoveredFlightCoords({
        fromLat: flightData.fromLat,
        fromLong: flightData.fromLong,
        toLat: flightData.toLat,
        toLong: flightData.toLong,
        fromCity: flightData.fromCity || flightData.from || 'Origin',
        toCity: flightData.toCity || flightData.to || 'Destination'
      });
    } else if (flightData.fromCoordinates && flightData.toCoordinates) {
      setHoveredFlightCoords({
        fromLat: flightData.fromCoordinates.lat,
        fromLong: flightData.fromCoordinates.long,
        toLat: flightData.toCoordinates.lat,
        toLong: flightData.toCoordinates.long,
        fromCity: flightData.fromCity || flightData.from || 'Origin',
        toCity: flightData.toCity || flightData.to || 'Destination'
      });
    }
    
    // Set the full flight data for the details card
    setHoveredFlightData(flightData);
  };

  return (
    <div className="space-y-4 overflow-x-hidden h-full flex flex-col">
      {/* SearchDetailsForm with full width */}
      <div className="min-w-full">
        <SearchDetailsForm 
          onFormChange={handleFormChange} 
          onShowRecentSearches={toggleRecentSearches}
        />
      </div>
      
      {/* Recent Searches Dialog */}
      <Dialog 
        header="Recent Searches" 
        visible={showRecentSearches} 
        style={{ width: '50vw' }} 
        onHide={() => setShowRecentSearches(false)}
      >
        <RecentSearch standalone={true} onCloseModal={() => setShowRecentSearches(false)} />
      </Dialog>
      
      {optionsLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-pulse">Loading search results...</div>
        </div>
      )}
      
      {optionsError && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-red-500">Error: {optionsError.message}</div>
        </div>
      )}
      
      {!optionsLoading && !optionsError && optionsData && (
        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* Left side - Cards as Tabs */}
          <div className="w-full md:w-[75%] flex flex-col h-full">
            {/* PrimeReact TabView for Match, Date Adjustment, and Base options */}
            <TabView 
              activeIndex={activeTabIndex} 
              onTabChange={e => setActiveTabIndex(e.index)}
              className="single-line-tabs flex-1 flex flex-col h-full"
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Match TabPanel */}
              {hasTabData('match') && (
                <TabPanel header={<div className="flex items-center gap-1">Empty Legs <span className="text-xs ml-1">({optionsData.match?.ids?.length || 0} Nearby)</span></div>}>
                  <div className="h-full">
                    <MatchCard 
                      match={optionsData.match} 
                      setHoveredFlightCoords={handleFlightHover} 
                      isTabContent={true}
                    />
                  </div>
                </TabPanel>
              )}
              {/* Date Adjustment TabPanel */}
              {hasTabData('dateAdjustment') && (
                <TabPanel header={<div className="flex items-center gap-1">Flexi Legs <span className="text-xs ml-1">({optionsData.dateAdjustment?.ids?.length || 0} Nearby)</span></div>}>
                  <div className="h-full">
                    <DateAdjustment 
                      adjustment={optionsData.dateAdjustment}
                      setHoveredFlightCoords={handleFlightHover} 
                      isTabContent={true}
                    />
                  </div>
                </TabPanel>
              )}
              {/* Base TabPanels */}
              {hasTabData('base') && optionsData.base.map((baseOption, index) => (
                <TabPanel 
                  key={index}
                  header={<div className="flex items-center">{baseOption.category}</div>}
                >
                  <div className="h-full">
                    <BaseCard 
                      itineraryData={{
                        ...optionsData,
                        base: [baseOption]
                      }} 
                      isTabContent={true}
                      selectedCategory={selectedBaseCategory}
                      onTailInfoUpdate={handleTailInfoUpdate}
                    />
                  </div>
                </TabPanel>
              ))}
            </TabView>
          </div>
          
          {/* Right side - Map and Flight Details Card (Sticky) */}
          <div className="w-full md:w-[25%] h-full flex flex-col">
            <div className="sticky top-4 flex flex-col">
              {/* Route Map */}
              <div className="h-[calc(100vh-350px)] overflow-hidden">
                <RouteMap 
                  itineraryData={optionsData} 
                  hoveredFlightCoords={hoveredFlightCoords}
                  tailMarkers={tailMarkers}
                />
              </div>
              
              {/* Flight Details Card - Only visible when hovering over a flight */}
              <div className="min-h-[200px]">
                {hoveredFlightData && (
                  <div className="transition-all duration-300 ease-in-out">
                    <FlightDetailsCard flightData={hoveredFlightData} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;