import React, { useEffect, useState } from 'react';
import AboutMe from '../../components/profile/AboutMe';
import UserDetailsGridLoader from '../../components/profile/UserDetailsGridLoader';
import { useUserDetails } from "../../context/profile/UserDetailsContext";

const UserProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchUserDetails, fetchCompanyDetails } = useUserDetails();

  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        // Fetch both user and company details concurrently
        await Promise.all([
          fetchUserDetails(),
          fetchCompanyDetails()
        ]);
      } catch (err) {
        console.error("Failed to fetch details:", err);
      } finally {
        setIsLoading(false); // Only set loading false after both requests complete
      }
    };

    fetchAllDetails();
  }, [fetchUserDetails, fetchCompanyDetails]);

  return (
    <div> 
      {isLoading ? <UserDetailsGridLoader /> : <AboutMe />}
    </div>
  );
};

export default UserProfilePage;