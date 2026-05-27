import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import KakaoCallback from './pages/KakaoCallback';
import MainPage from './pages/MainPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;