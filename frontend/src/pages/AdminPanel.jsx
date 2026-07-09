import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, productsRes, servicesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/products', config),
        axios.get('http://localhost:5000/api/admin/services', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
      alert('Failed to load admin data');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to ban/delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, config);
      setProducts(products.filter(p => p._id !== id));
      alert('Product deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting product');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/services/${id}`, config);
      setServices(services.filter(s => s._id !== id));
      alert('Service deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting service');
    }
  };

  if (loading) return <div className="text-center py-10">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Control Panel</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        {['dashboard', 'users', 'products', 'services'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-lg font-medium capitalize ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 shadow rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Services</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalServices}</p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue (Orders)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.isAdmin ? <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold">Admin</span> : 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!u.isAdmin && (
                      <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-900">Ban / Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(p => (
                <tr key={p._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.seller?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleDeleteProduct(p._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(s => (
                <tr key={s._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${s.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.provider?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleDeleteService(s._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
