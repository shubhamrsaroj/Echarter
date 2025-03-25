

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/auth/AuthContext';

const OtpVerificationForm = () => {
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useContext(AuthContext);

  const { email, isSignin } = location.state || {};
  const logo = import.meta.env.VITE_LOGO;

  const timerRef = useRef(null); // Store the timer ID

  // Start and manage the countdown timer
  useEffect(() => {
    // Redirect if no email
    if (!email) {
      navigate('/login');
      return;
    }

    // Start the countdown timer
    if (resendCountdown > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null; // Reset timerRef when countdown finishes
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup on unmount or when email changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [email, navigate]); // Only depends on email and navigate

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      const success = await verifyOtp(email, otp, isSignin);

      if (success) {
        navigate('/itinerary');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    try {
      setError('');
      await resendOtp(email);
      setResendCountdown(60); // Reset the countdown

      // Clear any existing timer and start a new one
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null; // Reset timerRef when countdown finishes
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError(error.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl w-full mx-auto p-10 bg-white rounded-xl shadow-lg space-y-6"
    >
      {/*  Tagline */}
       <div className="flex flex-col items-start mb-8">
        <h1 className="text-black text-center text-3xl font-medium ">
          Enter Code
        </h1>
        <p className="text-gray-600">
          Check the box "Keep me logged in" below to avoid logging in everytime.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Email Confirmation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-start text-gray-700">
          We've sent a verification code to <span className="font-medium">{email}</span>
        </p>
      </motion.div>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
            Verification Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400 transition-colors duration-200"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm transition-all duration-300 hover:border-blue-300"
              placeholder="Enter verification code"
              required
            />
          </div>
        </motion.div>

        {/* Keep me logged in checkbox */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center"
        >
          <input
            type="checkbox"
            id="keepLoggedIn"
            className="mr-2"
          />
          <label htmlFor="keepLoggedIn" className="text-gray-700 text-sm">
            Keep me logged in
          </label>
        </motion.div>

        {/* Log In Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 shadow-md disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Log In'}
        </motion.button>
      </form>

      {/* Go Back Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-right"
      >
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-300"
        >
          Go Back
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OtpVerificationForm;