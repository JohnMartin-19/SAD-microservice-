import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const Marketplace = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, image: 'https://via.placeholder.com/200?text=Tomatoes', title: 'Fresh Tomatoes - 10kg', price: 500, seller: 'John', location: 'Nakuru' },
    { id: 2, image: 'https://via.placeholder.com/200?text=Maize', title: 'Maize - 20kg', price: 800, seller: 'Mary', location: 'Nairobi' },
    { id: 3, image: 'https://via.placeholder.com/200?text=Potatoes', title: 'Potatoes - 15kg', price: 600, seller: 'Peter', location: 'Kisumu' },
  ]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

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

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Simulate fetching products from API
  useEffect(() => {
    // Replace with real API call
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(false); // Keep marketplace view after adding
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        {/* Search Bar */}
        <motion.div className="mb-4 position-relative" variants={fadeInUp}>
          <input
            type="text"
            className="form-control form-control-lg rounded-pill shadow-sm"
            placeholder="Search by crop, location, or price"
            style={{ maxWidth: '70%' }}
          />
          <br />
          <motion.button
            className="btn btn-success position-absolute top-0 end-0 mt-2 me-2 shadow-sm"
            onClick={() => setShowCart(true)}
            variants={scaleUp}
            whileHover={{ scale: 1.05 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-cart-fill"
              viewBox="0 0 16 16"
            >
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            ({cart.length})
          </motion.button>
        </motion.div>

        {/* Marketplace or Cart View */}
        {!showCart ? (
          <motion.div className="row g-4" variants={staggerChildren}>
            {/* Sidebar */}
            <motion.div className="col-md-3" variants={fadeInUp}>
              <Sidebar />
            </motion.div>

            {/* Product Grid */}
            <motion.div className="col-md-9" variants={staggerChildren}>
              <motion.div className="row row-cols-1 row-cols-md-3 g-4" variants={staggerChildren}>
                {products.map(product => (
                  <motion.div key={product.id} className="col" variants={scaleUp}>
                    <div className="card h-100 shadow-sm border-0">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h5 className="card-title fw-semibold text-dark">{product.title}</h5>
                        <p className="card-text text-muted">KES {product.price}</p>
                        <p className="card-text text-muted">{product.seller}, {product.location}</p>
                        <motion.button
                          className="btn btn-success w-100 shadow-sm"
                          onClick={() => addToCart(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="card shadow-sm border-0"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="card-body">
              <motion.h2 className="fw-semibold text-dark mb-4" variants={fadeInUp}>
                Your Cart
              </motion.h2>
              {cart.length === 0 ? (
                <motion.p className="text-muted" variants={fadeInUp}>
                  Your cart is empty.
                  <br />
                  <br />
                  <br />
                  <motion.button
                    className="btn btn-outline-success shadow-sm"
                    onClick={() => setShowCart(false)}
                    variants={scaleUp}
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                      />
                    </svg>
                    Marketplace
                  </motion.button>
                </motion.p>
              ) : (
                <motion.div variants={staggerChildren}>
                  <motion.table className="table table-hover" variants={staggerChildren}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <motion.tr key={item.id} variants={fadeInUp}>
                          <td>{item.title}</td>
                          <td>KES {item.price}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>KES {item.price * item.quantity}</td>
                          <td>
                            <motion.button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeFromCart(item.id)}
                              whileHover={{ scale: 1.05 }}
                            >
                              Remove
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
                  <motion.div
                    className="d-flex justify-content-between align-items-center mt-4"
                    variants={staggerChildren}
                  >
                    <motion.h4 className="fw-semibold" variants={fadeInUp}>
                      Total: KES {totalAmount}
                    </motion.h4>
                    <motion.div className="d-flex gap-2" variants={staggerChildren}>
                      <motion.button
                        className="btn btn-outline-success shadow-sm"
                        onClick={() => setShowCart(false)}
                        variants={scaleUp}
                        whileHover={{ scale: 1.05 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-arrow-left"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                          />
                        </svg>
                        Marketplace
                      </motion.button>
                      <motion.div variants={scaleUp}>
                        <Link to="/checkout" className="btn btn-success shadow-sm">
                          Checkout
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-arrow-right"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                            />
                          </svg>
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
};

export default Marketplace;