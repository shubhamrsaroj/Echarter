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
  const userRole = userData?.role || '';
  const isOperator = userRole === 'Operator';

  const handleButtonClick = (section) => {
    setActiveSection(section);
  };

  // Reset itinerary state when activeSection changes
  useEffect(() => {
    if (activeSection !== "Deals") {
      resetItineraryState(); // Clear itinerary state when leaving Deals page
    }
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