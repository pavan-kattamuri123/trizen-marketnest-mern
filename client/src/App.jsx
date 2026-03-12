import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Marketplace from './pages/Marketplace';
import BrandDashboard from './pages/BrandDashboard';

const App = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            user?.role === 'Brand' ? <Navigate to="/dashboard" /> : <Marketplace />
          } />
          
          <Route path="/dashboard" element={
            user?.role === 'Brand' ? <BrandDashboard /> : <Navigate to="/" />
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
