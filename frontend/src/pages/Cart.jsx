import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller?._id || item.seller // Depends on how populated
      }));

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/orders', {
        items: orderItems,
        totalAmount: getCartTotal(),
        shippingAddress: address
      }, config);
      
      clearCart();
      alert('Order placed successfully! Check your dashboard.');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired or is invalid. Please log in again.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to place order');
      }
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">Browse Products &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <ul className="divide-y divide-gray-200 bg-white shadow rounded-lg px-6">
            {cart.map((item) => (
              <li key={item._id} className="py-6 flex">
                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-center object-cover" />
                </div>
                <div className="ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3><Link to={`/products/${item._id}`}>{item.title}</Link></h3>
                      <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex-1 flex items-end justify-between text-sm">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item._id)} className="font-medium text-red-600 hover:text-red-500">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between text-base text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>${getCartTotal().toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
            
            {user ? (
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                  <textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" placeholder="Enter your full address..." />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </form>
            ) : (
              <Link to="/login" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Login to Checkout
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
