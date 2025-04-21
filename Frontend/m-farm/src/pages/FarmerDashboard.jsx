import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const FarmerDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    product_location: '', // Added product_location
    image: null,
  });
  const [revenue, setRevenue] = useState({ day: 0, week: 0, month: 0, year: 0 });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ label: 'Sales (KES)', data: [], borderColor: '#2e7d32', backgroundColor: 'rgba(46, 125, 50, 0.2)', fill: true }],
  });
  const navigate = useNavigate();

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
      navigate('/login');
    } else {
      fetchDashboardData(token);
    }
  }, [navigate]);

  // Fetch dynamic data
  const fetchDashboardData = async (token) => {
    try {
      // Fetch products
      const productResponse = await fetch('http://localhost:8000/mfarm/api/v1/myproducts/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!productResponse.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await productResponse.json();
      setListings(products);

      // Fetch orders
      const orderResponse = await fetch('http://localhost:8000/mfarm/api/v1/myorders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!orderResponse.ok) {
        throw new Error('Failed to fetch orders');
      }
      const orders = await orderResponse.json();
      setOrders(orders);

      // Fetch revenue
      const revenueResponse = await fetch('http://localhost:8000/mfarm/api/v1/revenue/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue');
      }
      const revenueData = await revenueResponse.json();
      setRevenue(revenueData);

      // Fetch sales data for chart
      const salesResponse = await fetch('http://localhost:8000/mfarm/api/v1/revenue/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Sales (KES)',
              data: [salesData.day, salesData.week / 4, salesData.month / 12, salesData.month, salesData.year / 12, salesData.year / 6],
              borderColor: '#2e7d32',
              backgroundColor: 'rgba(46, 125, 50, 0.2)',
              fill: true,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Tkone', token)
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('product_location', formData.product_location); // Added product_location
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch('http://localhost:8000/mfarm/api/v1/products/', { // Updated to /products/
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const newProduct = await response.json();
        setListings([...listings, newProduct]);
        setFormData({ name: '', description: '', price: '', quantity: '', product_location: '', image: null });
        toast.success('Product added successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/mfarm/api/v1/myproducts/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setListings(listings.filter(listing => listing.id !== id));
        toast.success('Product deleted successfully!');
      } else {
        toast.error('Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    }
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <ToastContainer position="top-right" autoClose={3000} />

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
                    <td>KES {listing.price}</td>
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
                  type="text"
                  name="product_location"
                  className="form-control"
                  placeholder="Product Location (e.g., Nairobi)"
                  value={formData.product_location}
                  onChange={handleInputChange}
                />
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

        {/* Orders Table */}
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
                    <td>{order.productorder > 0
                      ? order.productorder.map(item => item.product_name || item.product.name).join(', ')
                      : 'No products'}</td>
                    <td>{order.placed_by.username}</td>
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