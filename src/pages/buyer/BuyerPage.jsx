import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/buyer/Activity/ActivityCard';
import { ArrowLeft } from "lucide-react";

const BuyerPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/itinerary');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <ArrowLeft className="w-6 h-6 cursor-pointer text-black" onClick={handleBackClick} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <ActivityCard />
      </div>
    </div>
  );
};

export default BuyerPage;