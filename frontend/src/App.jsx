import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductForm from './pages/ProductForm';
import Services from './pages/Services';
import ServiceForm from './pages/ServiceForm';
import ServiceDetails from './pages/ServiceDetails';
import Cart from './pages/Cart';
import Chat from './pages/Chat';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './pages/AdminPanel';

const Home = () => <div className="p-8 text-center"><h1 className="text-4xl font-bold text-gray-900">Welcome to MarketHub</h1><p className="mt-4 text-gray-600">Find the best products and services.</p></div>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/new" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
              <Route path="/services/edit/:id" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
