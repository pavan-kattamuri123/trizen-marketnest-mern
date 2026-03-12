import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="font-extrabold text-2xl text-gray-900 tracking-tight">MarketNest</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm font-medium text-gray-700 mr-4">
                  Welcome, <span className="text-blue-600">{user.name}</span> ({user.role})
                </div>
                {user.role === 'Brand' && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition flex items-center font-medium">
                    <LayoutDashboard className="w-5 h-5 mr-1" />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-red-600 transition font-medium"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium font-medium transition">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
