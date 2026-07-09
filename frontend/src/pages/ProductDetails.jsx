import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product', error);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert('Added to cart!');
  };

  if (loading) return <div className="text-center py-10">Loading product details...</div>;
  if (!product) return <div className="text-center py-10 text-red-500">Product not found.</div>;

  const isOwner = user && user._id === product.seller?._id;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link to="/products" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">&larr; Back to Products</Link>
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img 
            src={product.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={product.title} 
            className="w-full h-96 object-cover"
          />
        </div>
        <div className="md:w-1/2 p-8">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-gray-900">{product.title}</h2>
            {isOwner && (
              <div className="flex space-x-2">
                <Link to={`/products/edit/${product._id}`} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Edit</Link>
                <button onClick={handleDelete} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">Category: {product.category}</p>
          <div className="mt-4 prose text-gray-700">
            <p>{product.description}</p>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="text-3xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Stock: {product.stock} available</p>
            <p className="text-sm text-gray-500 mt-1">Seller: {product.seller?.name}</p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={isOwner || product.stock === 0}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md font-bold hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {isOwner ? 'Cannot buy your own product' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            {!isOwner && user && (
              <Link 
                to={`/chat?userId=${product.seller?._id}`}
                className="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 px-4 rounded-md font-bold text-center hover:bg-indigo-50 transition"
              >
                Message Seller
              </Link>
            )}
            {!user && (
              <Link 
                to="/login"
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-bold text-center hover:bg-gray-50 transition"
              >
                Login to Message
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
