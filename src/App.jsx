import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthContext';

import { routes } from './routes';

const App = () => {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
};

export default App;