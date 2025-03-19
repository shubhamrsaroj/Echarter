// pages/auth/VerifyOtpPage.jsx
import React from 'react';
import OtpVerificationForm from '../../components/auth/OtpVerificationForm';
import AuthLayout from '../../layouts/AuthLayout'
const VerifyOtpPage = () => {
  return (
    <AuthLayout>
      <OtpVerificationForm/>
    </AuthLayout>
  );
};
export default VerifyOtpPage;