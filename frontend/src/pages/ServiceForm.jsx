import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ServiceForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [image, setImage] = useState(''); 
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/services/${id}`);
          setTitle(data.title);
          setDescription(data.description);
          setPrice(data.price);
          setCategory(data.category);
          setDeliveryTime(data.deliveryTime);
          if (data.portfolioImages && data.portfolioImages.length > 0) {
            setImage(data.portfolioImages[0]);
          }
        } catch (err) {
          setError('Failed to fetch service details');
        }
      };
      fetchService();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        title,
        description,
        price: Number(price),
        category,
        deliveryTime,
        portfolioImages: image ? [image] : []
      };

      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/services/${id}`, serviceData, config);
      } else {
        await axios.post('http://localhost:5000/api/services', serviceData, config);
      }
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
        {error && <div className="mb-4 bg-red-50 text-red-500 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea required rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
              <input type="text" placeholder="e.g., 3 days" required value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Portfolio Image URL</label>
            <input type="text" placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {isEditMode ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
