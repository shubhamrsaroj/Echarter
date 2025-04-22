import React, { useState, useEffect } from 'react';
import { useSearch } from '../../../context/CharterSearch/SearchContext';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, Info, ListCollapse, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { AcsService } from '../../../api/Acs/AcsService';
import ChatUI from '../../../components/chat/ChatUI';
import InfoModal from '../../common/InfoModal';
import { tokenHandler } from '../../../utils/tokenHandler';
import { toast } from 'react-toastify';

const PageContainer = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white -mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
};

const BrokerDetail = () => {
  const { selectedCompanyDetails, loading, error, itineraryData } = useSearch();
  const navigate = useNavigate();
  const broker = itineraryData?.broker || {};
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingInProgress, setIsConnectingInProgress] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [infoModalUrl, setInfoModalUrl] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  useEffect(() => {
    // Get user premium status from token
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      if (userData) {
        // Convert ANY non-empty truthy value to true
        // This will treat "True", "true", true, 1, etc as premium
        const isPremium = !!userData.IsPremium && 
          String(userData.IsPremium).toLowerCase() !== 'false' && 
          userData.IsPremium !== '0';
        
        setUserIsPremium(isPremium);
      }
    }
  }, []);

  const handleConnect = async (companyId) => {
    // Check if chat is minimized and active
    if (chatData && isChatMinimized) {
      toast.warning("Please close the ongoing chat first", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (isConnectingInProgress) {
      console.log('handleConnect already in progress, skipping...');
      return;
    }

    try {
      // Find the company details
      const company = selectedCompanyDetails.companyData.find(c => c.id === companyId);
      
      if (!company) {
        console.error('Company not found', companyId);
        return;
      }

      // First check userCount = 0
      if (company.userCount === 0) {
        // Show email only card first
        const emailOnlyPrompt = selectedCompanyDetails.prompts?.find(p => p.EmailOnly);
        setRecommendationData({
          companyId,
          company,
          message: emailOnlyPrompt?.EmailOnly || "At the moment this seller communicates through email.",
          requiresAction: true,
          type: "emailOnly"
        });
        setShowRecommendation(true);
        return;
      }

      // If userCount is not 0, directly check premium status
      checkPremiumAndRestricted(company);

    } catch (error) {
      console.error('Error in handleConnect:', error);
      toast.error('Failed to process connection: ' + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const checkPremiumAndRestricted = (company) => {
    // Check if user is premium
    if (userIsPremium) {
      // Premium user - show keep private option
      const premiumPrompt = selectedCompanyDetails.prompts?.find(p => p.IsPremium);
      setRecommendationData({
        companyId: company.id,
        company,
        message: premiumPrompt?.IsPremium || "Select Continue to allow other Sellers to message you.",
        requiresAction: true,
        type: "premium"
      });
      setShowRecommendation(true);
    } else {
      // Not premium - check if restricted
      if (company.isRestricted) {
        // Show restricted message
        const restrictedPrompt = selectedCompanyDetails.prompts?.find(p => p.IsRestricted);
        setRecommendationData({
          companyId: company.id,
          company,
          message: restrictedPrompt?.IsRestricted || "This seller accepts connections only from Gold members.",
          requiresAction: true,
          type: "restricted"
        });
        setShowRecommendation(true);
      } else {
        // Show standard non-premium message
        const notPremiumPrompt = selectedCompanyDetails.prompts?.find(p => p.IsNotPremium);
        setRecommendationData({
          companyId: company.id,
          company,
          message: notPremiumPrompt?.IsNotPremium || "Select Continue to allow other Sellers to message you.",
          requiresAction: true,
          type: "notPremium"
        });
        setShowRecommendation(true);
      }
    }
  };

  const handleContinue = () => {
    if (recommendationData && recommendationData.companyId) {
      // Close current recommendation modal
      setShowRecommendation(false);
      
      const company = selectedCompanyDetails.companyData.find(c => c.id === recommendationData.companyId);
      
      if (recommendationData.type === "emailOnly") {
        // If continuing from email only card, check premium status
        checkPremiumAndRestricted(company);
        return;
      }

      // For all other cases, proceed with connection
      if (recommendationData.type === "premium") {
        // For premium users, Continue sets needs=true
        console.log('DEBUG: Premium user - setting needs=true for Continue');
        proceedWithConnection(recommendationData.companyId, true);
      } else {
        // For all other cases, Continue uses default needs=true
        console.log('DEBUG: Non-premium user - setting needs=true');
        proceedWithConnection(recommendationData.companyId, true);
      }
    }
  };

  const handleKeepPrivate = () => {
    if (recommendationData && recommendationData.companyId) {
      // Close the recommendation modal immediately
      setShowRecommendation(false);
      
      // Keep Private sets needs=false (only shown for premium users)
      console.log('DEBUG: handleKeepPrivate called - setting needs=false');
      proceedWithConnection(recommendationData.companyId, false);
    }
  };

  const handleCloseRecommendation = () => {
    setShowRecommendation(false);
    setRecommendationData(null);
  };

  const handleCloseChat = () => {
    setChatData(null);
    setActiveCompanyId(null);
  };

  const proceedWithConnection = async (companyId, needs = true) => {
    setIsConnectingInProgress(true);
    setIsConnecting(true);
    setActiveCompanyId(companyId);
    
    try {
      console.log('Calling AcsService.getChatThread with companyId:', companyId, 'needs:', needs);
      const data = await AcsService.getChatThread({
        itineraryId: itineraryData?.itineraryId,
        companyId: companyId,
        needs: needs,
        isBuyer: true,
        source: 'easycharter',
        conversationId: null,
      });
      
      console.log('AcsService.getChatThread returned:', data);
      
      // Show success message from API response
      if (data.message) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Only set chat data if we have a threadId (for chat channel)
      if (data.threadId && data.channel !== 'Email') {
        setChatData(data);
      } else {
        // For email channel, just close the active company
        setActiveCompanyId(null);
      }
      
    } catch (error) {
      console.error('Error connecting to chat:', error);
      // Show error message from API if available, otherwise show generic error
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start chat';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setActiveCompanyId(null);
    } finally {
      setIsConnecting(false);
      setIsConnectingInProgress(false);
    }
  };

  // Recommendation Modal Component
  const RecommendationModal = () => {
    if (!recommendationData) return null;
    
    const { message, type } = recommendationData;
    
    // Common button style for consistent sizing
    const baseButtonClass = "px-6 py-2 rounded text-sm min-w-[120px] font-medium";
    const primaryButtonClass = `${baseButtonClass} bg-black text-white hover:bg-gray-800`;
    const secondaryButtonClass = `${baseButtonClass} border border-gray-300 text-black hover:bg-gray-50`;
    const goldButtonClass = `${baseButtonClass} bg-[#e0b32e] text-black hover:bg-[#c9a229]`;
    
    const renderButtons = () => {
      switch (type) {
        case "restricted":
        case "notPremium":
          // For both restricted and non-premium cases, show Gold and Continue buttons
          return (
            <div className="flex justify-between p-4 border-t border-gray-100">
              <button
                onClick={handleCloseRecommendation}
                className={goldButtonClass}
              >
                Gold
              </button>
              <button
                onClick={handleContinue}
                className={primaryButtonClass}
              >
                Continue
              </button>
            </div>
          );
        
        case "premium":
          // For premium users, show Keep Private and Continue
          return (
            <div className="flex justify-between p-4 border-t border-gray-100">
              <button
                onClick={handleKeepPrivate}
                className={secondaryButtonClass}
              >
                Keep Private
              </button>
              <button
                onClick={handleContinue}
                className={primaryButtonClass}
              >
                Continue
              </button>
            </div>
          );
        
        case "emailOnly":
          // For email only companies, show Go Back and Continue
          return (
            <div className="flex justify-between p-4 border-t border-gray-100">
              <button
                onClick={handleCloseRecommendation}
                className={secondaryButtonClass}
              >
                Go Back
              </button>
              <button
                onClick={handleContinue}
                className={primaryButtonClass}
              >
                Continue
              </button>
            </div>
          );
        
        default:
          // Fallback
          return (
            <div className="flex justify-end p-4 border-t border-gray-100">
              <button
                onClick={handleContinue}
                className={primaryButtonClass}
              >
                Continue
              </button>
            </div>
          );
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative animate-scaleIn overflow-hidden">
          {/* Close button */}
          <button 
            onClick={handleCloseRecommendation}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          >
            <X size={16} className="text-gray-700" />
          </button>
          
          {/* Content */}
          <div className="p-5">
            {/* Charter World Banner */}
            <div className="mb-4 relative">
              <img 
                src={recommendationData.company?.logo || "https://md.aviapages.com/media/2022/12/26/solairus-aviation.png"} 
                alt={recommendationData.company?.name || "Charter World"}
                className="w-full h-auto object-contain rounded"
                style={{ maxHeight: '120px' }}
              />
            </div>
            
            {/* Recommendation Section */}
            <div className="bg-white rounded-lg w-full">
              <h3 className="text-xl font-semibold mb-3">Recommendation</h3>
              <p className="text-black text-md mb-6">{message}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          {renderButtons()}
        </div>
      </div>
    );
  };
  
  const renderCompanyCard = (company) => {
    return (
      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-3">
        {/* Top Section: Logo + Info */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4">
          {/* Logo Section - 60% width */}
          <div className="flex-shrink-0 w-full sm:w-[60%] h-40 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center bg-white p-4">
            {company.logo ? (
              <div className="w-full h-full flex items-center justify-center relative">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-w-full max-h-full object-contain absolute inset-0 m-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <span className="text-black text-lg font-medium">No Logo</span>
            )}
          </div>

          {/* Company Info - Right Aligned - 40% width */}
          <div className="flex flex-col justify-start sm:ml-auto text-left sm:text-right w-full sm:w-[40%]">
            <h2 className="font-bold text-lg text-black">{company.name}</h2>
            <p className="text-md text-gray-600 mt-2">
              {company.city}
              {company.country ? `, ${company.country}` : ''}
            </p>
            {company.rankOverall !== null && (
              <div className="flex items-center mt-4 justify-start sm:justify-end">
                <div className="w-28 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full"
                    style={{ width: `${company.rankOverall || 0}%` }}
                  />
                </div>
                <p className="text-md font-semibold text-gray-600 ml-4">{company.rankOverall}</p>
              </div>
            )}
            <div className="flex items-center text-md text-gray-600 mt-2 justify-start sm:justify-end">
              <p>Trust Score</p>
              <Info 
                className="w-4 h-4 ml-1 cursor-pointer" 
                onClick={() => {
                  const trustScoreUrl = selectedCompanyDetails?.prompts?.find(p => p.TrustScore)?.TrustScore;
                  if (trustScoreUrl) {
                    setInfoModalUrl(trustScoreUrl);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Details button - always shown */}
        <div className="px-4 flex justify-end -mt-4">
          <div className="text-md flex flex-col items-center cursor-pointer">
            <ListCollapse className="w-5 h-5 text-black" />
            <p className="text-black">Details</p>
          </div>
        </div>

        {/* Certificates Section - Only shown if certificates exist */}
        {company.certificates && company.certificates.length > 0 && (
          <div className="px-4 -mt-10">
            <div className="flex space-x-2">
              {company.certificates.map((cert, index) => (
                <img key={index} src={cert.logo} alt={cert.name} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="px-4 pb-4">
          {/* Main Content: Headline and Description */}
          <div className="text-md w-full">
            <p className="font-bold text-lg">{company.hedline || ''}</p>
            <span>{company.description || ''}</span>
          </div>

          {/* Connect Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleConnect(company.id)}
              disabled={isConnecting && activeCompanyId === company.id}
              className={`px-4 py-1 rounded text-md flex items-center justify-center transition-colors ${
                isConnecting && activeCompanyId === company.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
              style={{ borderRadius: '3px' }}
            >
              {isConnecting && activeCompanyId === company.id ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !selectedCompanyDetails?.companyData || selectedCompanyDetails.companyData.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorDisplay error={error} onRetry={() => navigate('/itinerary')} />
      </PageContainer>
    );
  }

  // If recommendation modal is active
  if (showRecommendation) {
    return (
      <PageContainer>
        <div className="relative">
          {/* Main content (companies list) */}
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h1 className="font-bold text-3xl text-black">{broker.title}</h1>
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
                Showing {selectedCompanyDetails.companyData.length} {broker.title}
              </div>
            </div>

            <div className="space-y-4">
              {selectedCompanyDetails.companyData.map((company) => renderCompanyCard(company))}
            </div>
          </div>
          
          {/* Recommendation overlay */}
          <RecommendationModal />
        </div>
      </PageContainer>
    );
  }

  // If chat is active, render as an overlay on top of the companies view
  if (chatData && activeCompanyId) {
    return (
      <PageContainer>
        <div className="relative">
          {/* Main content (companies list) */}
          <div className="transition-all duration-300 overflow-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h1 className="font-bold text-3xl text-black">{broker.title}</h1>
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
                Showing {selectedCompanyDetails.companyData.length} {broker.title}
              </div>
            </div>

            <div className="space-y-4">
              {selectedCompanyDetails.companyData.map((company) => renderCompanyCard(company))}
            </div>
          </div>
          
          {/* Chat component with conditional rendering based on minimized state */}
          <div 
            className={`fixed ${isChatMinimized ? 'bottom-0 right-0 w-[400px] p-4' : 'inset-0 bg-black/20'} z-50 transition-all duration-300`}
            style={{ pointerEvents: isChatMinimized ? 'none' : 'auto' }}
          >
            <div 
              className={`${isChatMinimized ? '' : 'w-full h-full flex items-center justify-center p-4'}`}
            >
              <div 
                className={`${isChatMinimized ? '' : 'w-full max-w-3xl h-[80vh]'} relative`}
                style={{ pointerEvents: 'auto' }}
              >
                <ChatUI 
                  chatData={chatData} 
                  onClose={handleCloseChat}
                  onMinimizeChange={setIsChatMinimized}
                />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h1 className="font-bold text-3xl text-black">{broker.title}</h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            Showing {selectedCompanyDetails.companyData.length} {broker.title}
          </div>
        </div>

        <div className="space-y-4">
          {selectedCompanyDetails.companyData.map((company) => renderCompanyCard(company))}
        </div>
      </div>

      <InfoModal 
        url={infoModalUrl} 
        onClose={() => setInfoModalUrl(null)} 
      />
    </PageContainer>
  );
};

export default BrokerDetail;