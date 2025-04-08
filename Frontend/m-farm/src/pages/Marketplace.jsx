import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard'; // Assuming this is still used
import Sidebar from '../components/Sidebar';

const Marketplace = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([
    // Mock data for now; replace with API call later
    { id: 1, image: 'https://via.placeholder.com/200?text=Tomatoes', title: 'Fresh Tomatoes - 10kg', price: 'KES 500', seller: 'John', location: 'Nakuru' },
    { id: 2, image: 'https://via.placeholder.com/200?text=Maize', title: 'Maize - 20kg', price: 'KES 800', seller: 'Mary', location: 'Nairobi' },
    { id: 3, image: 'https://via.placeholder.com/200?text=Potatoes', title: 'Potatoes - 15kg', price: 'KES 600', seller: 'Peter', location: 'Kisumu' },
  ]);

  // Simulate fetching data from the database (replace with real API call)
  useEffect(() => {
    // Example API call (uncomment and adjust when ready)
    /*
    fetch('http://your-api-endpoint/api/products/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
    */
  }, []);

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Main Content */}
      <div className="container py-5" style={{ maxWidth: '70%' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill shadow-sm"
            placeholder="Search by crop, location, or price"
          />
        </div>

        {/* Sidebar and Product Grid */}
        <div className="row g-4">
          {/* Sidebar (25% width) */}
          <div className="col-md-3">
            <Sidebar />
          </div>

          {/* Product Grid (75% width) */}
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
                      <p className="card-text text-muted">{product.price}</p>
                      <p className="card-text text-muted">
                        {product.seller}, {product.location}
                      </p>
                      <button className="btn btn-success w-100 shadow-sm">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;