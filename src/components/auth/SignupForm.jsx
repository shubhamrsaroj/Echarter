
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { AuthContext } from "../../context/auth/AuthContext";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const logo = import.meta.env.VITE_LOGO;
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await signup(formData);

      if (response.success) {
        navigate("/verify-otp", { state: { email: formData.email, isSignin: false } });
      } else {
        setError(response.message || "Failed to sign up. Please try again.");
      }
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
       className="max-w-xl w-full mx-auto p-10 bg-white rounded-xl shadow-lg space-y-6"
    >
    
        <div className="flex flex-col items-start mb-8">
        <h1 className="text-black text-center text-3xl font-medium ">
         Free Sign Up
        </h1>
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

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input Field */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400 transition-colors duration-200" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm transition-all duration-300 hover:border-blue-300"
              placeholder="Enter your full name"
              required
            />
          </div>
        </motion.div>

        {/* Email Input Field */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400 transition-colors duration-200" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm transition-all duration-300 hover:border-blue-300"
              placeholder="Enter your email"
              required
            />
          </div>

          <p className="mt-8 text-base">
            You must have access to the email entered above
          </p>
        
        </motion.div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 shadow-md disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </motion.button>
      </form>

      {/* Sign In Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
          >
            Sign In
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignupForm;