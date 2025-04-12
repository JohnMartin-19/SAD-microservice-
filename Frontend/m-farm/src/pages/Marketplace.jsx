import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const Marketplace = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'CEREALS', label: 'Cereals' },
    { value: 'LEGUMES', label: 'Legumes' },
    { value: 'ROOTS_TUBERS', label: 'Roots and Tubers' },
    { value: 'VEGETABLES', label: 'Vegetables' },
    { value: 'FRUITS', label: 'Fruits' },
    { value: 'NUTS_SEEDS', label: 'Nuts and Seeds' },
    { value: 'LIVESTOCK', label: 'Livestock' },
    { value: 'LIVESTOCK_PRODUCTS', label: 'Livestock Products' },
    { value: 'POULTRY', label: 'Poultry' },
    { value: 'FISH', label: 'Fish' },
    { value: 'HERBS_SPICES', label: 'Herbs and Spices' },
    { value: 'OIL_CROPS', label: 'Oil Crops' },
    { value: 'FIBER_CROPS', label: 'Fiber Crops' },
    { value: 'FORESTRY_PRODUCTS', label: 'Forestry Products' },
    { value: 'OTHER', label: 'Other' },
  ];

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
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = categoryFilter
          ? `http://localhost:8000/mfarm/api/v1/products/?category=${categoryFilter}`
          : 'http://localhost:8000/mfarm/api/v1/products/';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('API Response:', data);
        const mappedProducts = data.map((product, index) => ({
          id: product.id || `temp-id-${index}`, // Fallback ID
          title: product.name || 'Untitled',
          price: product.price ? parseFloat(product.price) : (product.quantity ? parseFloat(product.quantity) * 50 : 500),
          seller: product.user?.username || 'Unknown',
          location: product.product_location || 'Unknown Location',
          image: product.image ? `http://localhost:8000${product.image}` : 'https://via.placeholder.com/200',
          category: product.category || 'Uncategorized',
        }));
        console.log('Mapped Products:', mappedProducts);
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => {
      const title = (product.title || '').toLowerCase();
      const location = (product.location || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      return (
        title.includes(query) ||
        location.includes(query) ||
        category.includes(query)
      );
    });
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const addToCart = (product) => {
    console.log('Attempting to add product:', product);

    if (!product.id) {
      console.error('Product missing ID:', product);
      return;
    }

    console.log('Current cart before update:', cart);

    const existingItem = cart.find(item => item.id === product.id);
    console.log('Existing item:', existingItem);

    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    console.log('New cart state:', newCart);
    setCart(newCart);
    setShowCart(false); // Show cart to verify addition
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

      <motion.div
        className="container py-5"
        style={{ maxWidth: '70%' }}
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <motion.div className="mb-4 position-relative" variants={fadeInUp}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <input
              type="text"
              className="form-control form-control-lg rounded-pill shadow-sm"
              placeholder="Search by crop, location, or category"
              style={{ maxWidth: '70%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select shadow-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
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
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 1 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 1 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 1 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 1 1 0-2" />
            </svg>
            ({cart.length})
          </motion.button>
        </motion.div>

        {isLoading ? (
          <motion.div variants={fadeInUp} className="text-center">
            <p>Loading products...</p>
          </motion.div>
        ) : (
          !showCart ? (
            <motion.div className="row g-4" variants={staggerChildren}>
              <motion.div className="col-md-3" variants={fadeInUp}>
                <Sidebar />
              </motion.div>
              <motion.div className="col-md-9" variants={staggerChildren}>
                {filteredProducts.length === 0 ? (
                  <motion.p variants={fadeInUp}>No products found.</motion.p>
                ) : (
                  <motion.div className="row row-cols-1 row-cols-md-3 g-4" variants={staggerChildren}>
                    {filteredProducts.map(product => (
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
                )}
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
                          d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 0 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
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
                              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 0 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l-4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
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
          )
        )}
      </motion.div>

     
    </div>
  );
};

export default Marketplace;