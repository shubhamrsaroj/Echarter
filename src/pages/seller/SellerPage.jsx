import React, { useEffect } from "react";
import DealsNavBar from "../../components/seller/Navbar/SellerNavBar";
import DealCard from "../../components/seller/Deal/DealCard";
import HaveCard from "../../components/seller/Have/HaveCard";
import NeedCard from "../../components/seller/Need/NeedCard";
import { useSellerContext } from "../../context/seller/SellerContext";

const SellerPage = () => {
  const [activeSection, setActiveSection] = React.useState(null);
  const { resetItineraryState } = useSellerContext();

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
      <DealsNavBar onButtonClick={handleButtonClick} />
      {activeSection === "Deals" && <DealCard />}
      {activeSection === "Haves" && <HaveCard />}
      {activeSection === "Needs" && <NeedCard />}
    </div>
  );
};

export default SellerPage;