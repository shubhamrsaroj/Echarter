import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import AuthLayout from '../../layouts/AuthLayout'
const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage