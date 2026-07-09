import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const fetchProducts = async (paramsString = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products${paramsString}`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    const queryString = new URLSearchParams(params).toString();
    fetchProducts(queryString ? `?${queryString}` : '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  const handleClear = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Products</h2>
        {user && (
          <Link to="/products/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            Create Product
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4">Filters</h3>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Search</label>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keywords..." className="mt-1 w-full border rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label className="block text-sm text-gray-700">Min Price</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className="mt-1 w-full border rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-gray-700">Max Price</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="$Max" className="mt-1 w-full border rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="w-2/3 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 transition">Apply</button>
              <button type="button" onClick={handleClear} className="w-1/3 bg-gray-200 text-gray-700 rounded p-2 hover:bg-gray-300 transition">Clear</button>
            </div>
          </form>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition flex flex-col">
                  <img 
                    src={product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={product.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                    <div className="mt-auto pt-4">
                      <p className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                      <Link 
                        to={`/products/${product._id}`}
                        className="mt-4 block w-full text-center bg-indigo-50 text-indigo-700 py-2 rounded-md font-medium hover:bg-indigo-100 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">No products found matching your criteria.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
