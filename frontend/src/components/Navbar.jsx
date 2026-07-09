import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">MarketHub</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-indigo-600 font-medium">Products</Link>
            <Link to="/services" className="text-gray-700 hover:text-indigo-600 font-medium">Services</Link>
            <Link to="/cart" className="text-gray-700 hover:text-indigo-600 font-medium relative">
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className="text-red-600 hover:text-red-800 font-bold bg-red-50 px-3 py-1 rounded">Admin Panel</Link>
                )}
                <Link to="/chat" className="text-gray-700 hover:text-indigo-600 font-medium">Messages</Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">Dashboard</Link>
                <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium">Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
