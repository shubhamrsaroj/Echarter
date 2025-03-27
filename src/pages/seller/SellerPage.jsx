// SellerPage.js
import React, { useState } from 'react';
import DealsNavBar from '../../components/seller/Navbar/SellerNavBar';
import DealCard from '../../components/seller/Deal/DealCard';
import HaveCard from '../../components/seller/Have/HaveCard';

const SellerPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleButtonClick = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <DealsNavBar onButtonClick={handleButtonClick} />
      {activeSection === 'Deals' && <DealCard  />}
      {activeSection === 'Haves' && <HaveCard />}
      {/* You can add a component for 'Needs' later if needed */}
    </>
  );
};

export default SellerPage;