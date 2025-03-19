import React, { useEffect, useState } from 'react';
import AboutMe from '../../components/profile/AboutMe';
import UserDetailsGridLoader from '../../components/profile/UserDetailsGridLoader';
import { useUserDetails } from "../../context/profile/UserDetailsContext";

const UserProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchUserDetails } = useUserDetails();

  useEffect(() => {
    fetchUserDetails().then(() => {
      setIsLoading(false);
    }).catch((err) => {
      console.error("Failed to fetch user details:", err);
      setIsLoading(false); // Still stop loading on error
    });
  }, [fetchUserDetails]);

  return (
    <div> 
      {isLoading ? <UserDetailsGridLoader /> : <AboutMe />}
    </div>
  );
};

export default UserProfilePage;