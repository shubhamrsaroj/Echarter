// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//     <ToastContainer position="top-right" autoClose={3000} />
//   </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from "primereact/api"
import { twMerge } from 'tailwind-merge'

// Import Tailwind CSS first
import './index.css'

// PrimeReact CSS imports - after Tailwind
import 'primereact/resources/themes/fluent-light/theme.css';
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

// React Toastify CSS
import "react-toastify/dist/ReactToastify.css"

import App from './App.jsx'
import { ToastContainer } from "react-toastify"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={{
      ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge }
    }}>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </PrimeReactProvider>
  </StrictMode>
)