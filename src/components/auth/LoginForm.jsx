// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { AuthContext } from '../../context/auth/AuthContext';

// const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const logo = import.meta.env.VITE_LOGO;
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!email) {
//       setError('Please enter your email address');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await login(email);

//       if (response.success) {
//         navigate('/verify-otp', { state: { email, isSignin: true } });
//       } else {
//         setError(response.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch (error) {
//       setError(error.message || 'Something went wrong. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="max-w-xl w-full mx-auto p-10 bg-white rounded-xl shadow-lg space-y-6"
//     >
//       <div className="flex flex-col items-center mb-8">
//         <img 
//           src={logo} 
//           alt="EasyCharter Logo" 
//           className="h-20 w-auto mb-3 transition-transform duration-300 hover:scale-105"
//         />
//         <p className="text-gray-500 text-center text-sm font-light">
//           Global Air Charter Marketplace on Your Desktop
//         </p>
//       </div>

//       {error && (
//         <motion.div 
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-6"
//         >
//           <p className="font-medium">Error</p>
//           <p>{error}</p>
//         </motion.div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//         >
//           <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
//             Email Address
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <svg 
//                 className="h-5 w-5 text-gray-400 transition-colors duration-200" 
//                 xmlns="http://www.w3.org/2000/svg" 
//                 viewBox="0 0 20 20" 
//                 fill="currentColor"
//               >
//                 <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                 <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//               </svg>
//             </div>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm transition-all duration-300 hover:border-blue-300"
//               placeholder="Enter your email"
//               required
//             />
//           </div>
//         </motion.div>

//         <motion.button
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.97 }}
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 shadow-md disabled:opacity-50"
//         >
//           {isLoading ? 'Sending Code...' : 'Send Code'}
//         </motion.button>
//       </form>

//       <div className="mt-8 text-center">
//         <p className="text-sm text-gray-600">
//           Don't have an account?{' '}
//           <a 
//             href="/signup" 
//             className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
//           >
//             Sign Up Free
//           </a>
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// export default LoginForm;



import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/auth/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await login(email);

      if (response.success) {
        navigate('/verify-otp', { state: { email, isSignin: true } });
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
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
          Login
        </h1>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-6"
        >
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-3">
           Enter your Login Email 
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm transition-all duration-300 hover:border-blue-300"
              placeholder="Enter your email"
              required
            />
          </div>
    
          <p className="mt-8 text-base">
            You must have access to the email entered above
          </p>
        
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 shadow-md disabled:opacity-50 text-base font-normal mt-2"
        >
          {isLoading ? 'Sending Code...' : 'Send Code'}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a 
            href="/signup" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
          >
            Sign Up Free
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;