import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
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

  // Mock chart data
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/dashboard'); // Fixed redirect to login
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  // Simulate API data fetching
  const fetchDashboardData = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Listing:', formData);
    setFormData({ name: '', description: '', price: '', quantity: '', image: null });
  };

  const handleDelete = (id) => {
    setListings(listings.filter(listing => listing.id !== id));
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Main Content */}
      <motion.div
        className="container py-5"
        style={{ maxWidth: '70%' }}
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        {/* Overview Section - Revenue Cards */}
        <motion.h2
          className="display-6 fw-semibold text-center mb-5 text-success"
          variants={fadeInUp}
        >
          Farmer Dashboard
        </motion.h2>
        <motion.div className="row row-cols-1 row-cols-md-4 g-4 mb-5" variants={staggerChildren}>
          {[
            { title: 'Daily Revenue', value: revenue.day },
            { title: 'Weekly Revenue', value: revenue.week },
            { title: 'Monthly Revenue', value: revenue.month },
            { title: 'Yearly Revenue', value: revenue.year },
          ].map((item, index) => (
            <motion.div key={index} className="col" variants={scaleUp}>
              <div className="card shadow-sm border-0 text-center">
                <div className="card-body">
                  <h5 className="card-title text-muted">{item.title}</h5>
                  <p className="card-text fw-bold text-success">KES {item.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          className="card shadow-sm border-0 mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Sales Analytics</h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Line data={chartData} options={chartOptions} />
            </motion.div>
          </div>
        </motion.div>

        {/* Listings Table */}
        <motion.div
          className="card shadow-sm border-0 mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="card-body">
            <motion.h3 className="fw-semibold text-dark mb-4" variants={fadeInUp}>
              Your Listings
            </motion.h3>
            <motion.table className="table table-hover" variants={staggerChildren}>
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
                  <motion.tr key={listing.id} variants={fadeInUp}>
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
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </motion.div>

        {/* Add Listing Form */}
        <motion.div
          className="card shadow-sm border-0 mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="card-body">
            <motion.h3 className="fw-semibold text-dark mb-4" variants={fadeInUp}>
              Add New Product Listing
            </motion.h3>
            <motion.form onSubmit={handleSubmit} variants={staggerChildren}>
              <motion.div className="mb-3" variants={fadeInUp}>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>
              <motion.div className="mb-3" variants={fadeInUp}>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </motion.div>
              <motion.div className="row mb-3" variants={staggerChildren}>
                <div className="col">
                  <motion.input
                    type="text"
                    name="price"
                    className="form-control"
                    placeholder="Price (KES)"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    variants={fadeInUp}
                  />
                </div>
                <div className="col">
                  <motion.input
                    type="number"
                    name="quantity"
                    className="form-control"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    variants={fadeInUp}
                  />
                </div>
              </motion.div>
              <motion.div className="mb-3" variants={fadeInUp}>
                <input
                  type="file"
                  name="image"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </motion.div>
              <motion.button
                type="submit"
                className="btn btn-success w-100 shadow-sm"
                variants={scaleUp}
                whileHover={{ scale: 1.05 }}
              >
                Add Product 
              </motion.button>
            </motion.form>
          </div>
        </motion.div>

        {/* Orders Tab */}
        <motion.div
          className="card shadow-sm border-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="card-body">
            <motion.h3 className="fw-semibold text-dark mb-4" variants={fadeInUp}>
              Incoming Orders
            </motion.h3>
            <motion.table className="table table-hover" variants={staggerChildren}>
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
                  <motion.tr key={order.id} variants={fadeInUp}>
                    <td>{order.product}</td>
                    <td>{order.buyer}</td>
                    <td>{order.quantity}</td>
                    <td>{order.status}</td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FarmerDashboard;