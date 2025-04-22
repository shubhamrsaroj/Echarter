import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

const ErrorDisplay = ({
  message = "Unable to load data. Please try again later.",
  onRetry,
  onReturn,
  icon = "error",
  title = "Error Loading Details",
  errorCode,
  showHomeButton = true
}) => {
  // Icon selection based on prop
  const IconComponent = () => {
    switch (icon) {
      case "refresh":
        return <RefreshCw size={32} className="text-red-500" />;
      case "home":
        return <Home size={32} className="text-red-500" />;
      case "error":
      default:
        return <AlertCircle size={32} className="text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-64 w-full py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-pulse">
        <IconComponent />
      </div>
      
      <h3 className="text-red-500 text-xl font-semibold mb-2">{title}</h3>
      
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {errorCode && (
        <p className="text-gray-400 text-sm mb-6">Error Code: {errorCode}</p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        )}
        
        {showHomeButton && onReturn && (
          <button
            onClick={onReturn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
          >
            <Home size={16} className="mr-2" />
            Return to Itinerary
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;