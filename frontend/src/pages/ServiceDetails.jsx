import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/services/${id}`);
        setService(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service:', error);
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        navigate('/services');
      } catch (error) {
        console.error('Error deleting service', error);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading service details...</div>;
  if (!service) return <div className="text-center py-10 text-red-500">Service not found.</div>;

  const isOwner = user && user._id === service.provider?._id;

  const handleBooking = async (e) => {
    e.preventDefault();
    const date = e.target.bookingDate.value;
    const notes = e.target.notes.value;
    try {
      await axios.post('http://localhost:5000/api/bookings', 
        { serviceId: service._id, bookingDate: date, notes },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Service booked successfully! Check your dashboard.');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book service');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link to="/services" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">&larr; Back to Services</Link>
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img 
            src={service.portfolioImages[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={service.title} 
            className="w-full h-96 object-cover"
          />
        </div>
        <div className="md:w-1/2 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 inline-block mr-3">{service.title}</h2>
              {service.availability ? (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded align-middle">Available</span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded align-middle">Busy</span>
              )}
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <Link to={`/services/edit/${service._id}`} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Edit</Link>
                <button onClick={handleDelete} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">Category: {service.category}</p>
          <div className="mt-4 prose text-gray-700">
            <p>{service.description}</p>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="text-3xl font-bold text-indigo-600">${service.price}</p>
            <p className="text-sm text-gray-500 mt-2">Delivery Time: {service.deliveryTime}</p>
            <p className="text-sm text-gray-500 mt-1">Provider: {service.provider?.name}</p>
          </div>
          <div className="mt-8">
            <div className="bg-white p-6 shadow rounded-lg border border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Contact & Booking</h3>
              {!isOwner && user ? (
                <Link 
                  to={`/chat?userId=${service.provider?._id}`}
                  className="block w-full bg-indigo-50 text-indigo-700 text-center py-2 px-4 rounded-md font-bold hover:bg-indigo-100 transition mb-6"
                >
                  Message Provider
                </Link>
              ) : !user && (
                <Link 
                  to="/login"
                  className="block w-full bg-gray-50 text-gray-700 text-center py-2 px-4 rounded-md font-bold border border-gray-300 hover:bg-gray-100 transition mb-6"
                >
                  Login to Message
                </Link>
              )}
              <h4 className="font-medium text-gray-900 mb-4">Request a Booking</h4>
            </div>

            {user && !isOwner && service.availability ? (
              <form onSubmit={handleBooking} className="space-y-4 border p-4 rounded-md bg-gray-50">
                <h4 className="font-bold text-gray-900">Book this service</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" name="bookingDate" required min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea name="notes" rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold hover:bg-indigo-700 transition">
                  Confirm Booking
                </button>
              </form>
            ) : !user ? (
              <Link to="/login" className="block text-center w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold hover:bg-indigo-700 transition">Login to Book</Link>
            ) : isOwner ? (
              <div className="text-center p-3 bg-gray-100 rounded text-gray-500">You are the provider of this service.</div>
            ) : (
              <div className="text-center p-3 bg-red-50 rounded text-red-500">Service currently unavailable.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
