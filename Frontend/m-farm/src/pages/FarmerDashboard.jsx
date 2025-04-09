import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const FarmerDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '', image: null });
  const [revenue, setRevenue] = useState({ day: 0, week: 0, month: 0, year: 0 });
  const navigate = useNavigate();

  // Mock chart data (replace with API data)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales (KES)',
        data: [1200, 1900, 3000, 5000, 2300, 3400],
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Sales Analytics' } },
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/dashboard'); // Redirect to login if not authenticated
    } else {
      // Fetch data from API (mocked for now)
      fetchDashboardData();
    }
  }, [navigate]);

  // Simulate API data fetching
  const fetchDashboardData = () => {
    // Replace with real API calls
    setListings([
      { id: 1, name: 'Tomatoes', description: 'Fresh red tomatoes', price: 'KES 500', quantity: 10 },
      { id: 2, name: 'Maize', description: 'Yellow maize', price: 'KES 800', quantity: 20 },
    ]);
    setOrders([
      { id: 1, product: 'Tomatoes', buyer: 'Jane', quantity: 5, status: 'Pending' },
      { id: 2, product: 'Maize', buyer: 'Peter', quantity: 10, status: 'Shipped' },
    ]);
    setRevenue({ day: 500, week: 2000, month: 8000, year: 50000 });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Handle form submission (POST to API)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call (replace with real POST request)
    console.log('New Listing:', formData);
    // Example API call:
    /*
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
    fetch('http://your-api-endpoint/api/listings/', {
      method: 'POST',
      body: formDataToSend,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => response.json())
      .then(data => setListings([...listings, data]))
      .catch(error => console.error('Error adding listing:', error));
    */
    setFormData({ name: '', description: '', price: '', quantity: '', image: null }); // Reset form
  };

  // Delete listing
  const handleDelete = (id) => {
    // Simulate API call
    setListings(listings.filter(listing => listing.id !== id));
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Main Content */}
      <div className="container py-5" style={{ maxWidth: '70%' }}>
        {/* Overview Section - Revenue Cards */}
        <h2 className="display-6 fw-semibold text-center mb-5 text-success">Farmer Dashboard</h2>
        <div className="row row-cols-1 row-cols-md-4 g-4 mb-5">
          <div className="col">
            <div className="card shadow-sm border-0 text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Daily Revenue</h5>
                <p className="card-text fw-bold text-success">KES {revenue.day}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card shadow-sm border-0 text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Weekly Revenue</h5>
                <p className="card-text fw-bold text-success">KES {revenue.week}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card shadow-sm border-0 text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Monthly Revenue</h5>
                <p className="card-text fw-bold text-success">KES {revenue.month}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card shadow-sm border-0 text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Yearly Revenue</h5>
                <p className="card-text fw-bold text-success">KES {revenue.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Sales Analytics</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Listings Table */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Your Listings</h3>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id}>
                    <td>{listing.name}</td>
                    <td>{listing.description}</td>
                    <td>{listing.price}</td>
                    <td>{listing.quantity}</td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm me-2">Edit</button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Listing Form */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Add New Listing</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="row mb-3">
                <div className="col">
                  <input
                    type="text"
                    name="price"
                    className="form-control"
                    placeholder="Price (KES)"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <input
                  type="file"
                  name="image"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <button type="submit" className="btn btn-success w-100 shadow-sm">
                Add Listing
              </button>
            </form>
          </div>
        </div>

        {/* Orders Tab */}
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Incoming Orders</h3>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.product}</td>
                    <td>{order.buyer}</td>
                    <td>{order.quantity}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmerDashboard;