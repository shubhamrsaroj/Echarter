import React, { useEffect } from "react";
import DealsNavBar from "../../components/seller/Navbar/SellerNavBar";
import DealCard from "../../components/seller/Deal/DealCard";
import HaveCard from "../../components/seller/Have/HaveCard";
import NeedCard from "../../components/seller/Need/NeedCard";
import { useSellerContext } from "../../context/seller/SellerContext";
import { tokenHandler } from "../../utils/tokenHandler";

const SellerPage = () => {
  const [activeSection, setActiveSection] = React.useState(null);
  const { resetItineraryState } = useSellerContext();

  // Get user role from token
  const token = tokenHandler.getToken();
  const userData = token ? tokenHandler.parseUserFromToken(token) : null;
  const userRoles = (userData?.role || '').split(',').map(role => role.trim());
  // const isOperator =  userRoles.some(role => ['Broker', 'Operator','User'].includes(role));
  const isOperator = userRoles.includes('Operator');


  const handleButtonClick = (section) => {
    setActiveSection(section);
  };

  // Reset itinerary state when activeSection changes
  useEffect(() => {
    // Clear itinerary state when changing sections
    if (activeSection !== "Deals") {
      console.log('SellerPage: Resetting itinerary state when leaving Deals');
      resetItineraryState();
    }
    
    // Log the section change
    console.log('SellerPage: Section changed to', activeSection || 'none');
  }, [activeSection, resetItineraryState]);

  return (
    <div className="w-full p-4">
      <DealsNavBar onButtonClick={handleButtonClick} isOperator={isOperator} />
      {activeSection === "Deals" && <DealCard />}
      {activeSection === "Haves" && isOperator && <HaveCard />}
      {activeSection === "Needs" && <NeedCard />}
    </div>
  );
};

export default SellerPage;