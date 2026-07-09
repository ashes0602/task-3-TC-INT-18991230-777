import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Bookings (Services)
  const [myBookings, setMyBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  
  // Orders (Products)
  const [myOrders, setMyOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [myBRes, incBRes, myORes, incORes] = await Promise.all([
          axios.get('http://localhost:5000/api/bookings', config),
          axios.get('http://localhost:5000/api/bookings/provider', config),
          axios.get('http://localhost:5000/api/orders', config),
          axios.get('http://localhost:5000/api/orders/seller', config)
        ]);
        setMyBookings(myBRes.data);
        setIncomingBookings(incBRes.data);
        setMyOrders(myORes.data);
        setIncomingOrders(incORes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status }, config);
      const res = await axios.get('http://localhost:5000/api/bookings/provider', config);
      setIncomingBookings(res.data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status: 'cancelled' }, config);
      const res = await axios.get('http://localhost:5000/api/bookings', config);
      setMyBookings(res.data);
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status }, config);
      const res = await axios.get('http://localhost:5000/api/orders/seller', config);
      setIncomingOrders(res.data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* ---------------- PRODUCT ORDERS ---------------- */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900">📦 Product Orders</h2>
      </div>

      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">My Purchases</h3>
        {myOrders.length === 0 ? <p className="text-gray-500">You haven't bought any products.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID / Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <p className="font-medium text-gray-900">#{o._id.substring(o._id.length - 6)}</p>
                      <p>{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc pl-4">
                        {o.items.map(item => (
                          <li key={item._id}>{item.title} (x{item.quantity})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${o.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Sales (Products I'm Selling)</h3>
        {incomingOrders.length === 0 ? <p className="text-gray-500">No incoming orders.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID / Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items / Shipping</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomingOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <p className="font-medium text-gray-900">#{o._id.substring(o._id.length - 6)}</p>
                      <p>{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.customer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc pl-4 mb-2">
                        {o.items.filter(item => item.seller.toString() === user._id.toString()).map(item => (
                          <li key={item._id}>{item.title} (x{item.quantity})</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-400">Address: {o.shippingAddress}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={o.status} 
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        className="border rounded p-1 text-sm"
                        disabled={o.status === 'cancelled'}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------------- SERVICE BOOKINGS ---------------- */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-12">
        <h2 className="text-xl font-bold text-indigo-900">📅 Service Bookings</h2>
      </div>

      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">My Bookings (Requests I've Made)</h3>
        {myBookings.length === 0 ? <p className="text-gray-500">You haven't booked any services yet.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link to={`/services/${b.service?._id}`}>{b.service?.title}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.provider?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${b.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          b.status === 'rejected' || b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {b.status === 'pending' && (
                        <button onClick={() => handleCancelBooking(b._id)} className="text-red-600 hover:text-red-900">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Incoming Bookings (Requests for My Services)</h3>
        {incomingBookings.length === 0 ? <p className="text-gray-500">No incoming bookings.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomingBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link to={`/services/${b.service?._id}`}>{b.service?.title}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.customer?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${b.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          b.status === 'rejected' || b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateBookingStatus(b._id, 'accepted')} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">Accept</button>
                          <button onClick={() => handleUpdateBookingStatus(b._id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Reject</button>
                        </>
                      )}
                      {b.status === 'accepted' && (
                        <button onClick={() => handleUpdateBookingStatus(b._id, 'completed')} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">Mark Completed</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;
