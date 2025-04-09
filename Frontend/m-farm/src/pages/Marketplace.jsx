import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    /*
    fetch('http://your-api-endpoint/api/products/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(data => setProducts(data.map(p => ({ ...p, price: parseInt(p.price) }))))
      .catch(error => console.error('Error fetching products:', error));
    */
  }, []);

  // Add item to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(false); // Show cart after adding
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta); // Minimum 1
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Calculate total amount
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Main Content */}
      <div className="container py-5" style={{ maxWidth: '70%' }}>
        {/* Search Bar */}
        <div className="mb-4 position-relative">
          <input style={{ maxWidth: '70%' }}
            type="text"
            className="form-control form-control-lg rounded-pill shadow-sm"
            placeholder="Search by crop, location, or price"
          />
          <br />
          <button
            className="btn btn-success position-absolute top-0 end-0 mt-2 me-2 shadow-sm"
            onClick={() => setShowCart(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-cart-fill" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
            Cart ({cart.length})
          </button>
          
        </div>
        

        {/* Marketplace or Cart View */}
        {!showCart ? (
          <div className="row g-4">
            {/* Sidebar */}
            <div className="col-md-3">
              <Sidebar />
              
            </div>

            {/* Product Grid */}
            <div className="col-md-9">
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {products.map(product => (
                  <div key={product.id} className="col">
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
                        <button
                          className="btn btn-success w-100 shadow-sm"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="fw-semibold text-dark mb-4">Your Cart</h2>
              {cart.length === 0 ? (
                <p className="text-muted">
                    Your cart is empty.
                    <br />
                    <br />
                    <br />
                <button
                        className="btn btn-outline-success shadow-sm"
                        onClick={() => setShowCart(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg> 
                        Marketplace
                      </button>
                </p>
                
              ) : (
                <>
                  <table className="table table-hover">
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
                        <tr key={item.id}>
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
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <h4 className="fw-semibold">Total: KES {totalAmount}</h4>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-success shadow-sm"
                        onClick={() => setShowCart(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg> 
                        Marketplace
                      </button>
                      <Link to="/checkout" className="btn btn-success shadow-sm">
                      Checkout
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                        </svg> 
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;