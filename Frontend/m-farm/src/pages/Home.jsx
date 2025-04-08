import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Hero Section */}
      <section
        className="d-flex align-items-center justify-content-center text-white"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504279573657-236ab806dbfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'),linear-gradient(to bottom,rgb(46, 125, 50), rgba(244, 247, 244, 0.5))",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
 // Fallback color if image fails
        }}
      >
        <div className="text-center px-3" style={{ background: 'transparent' }}>
          <h1 className="display-4 fw-semibold mb-4 text-shadow">
            Welcome to M-Farm
          </h1>
          <p className="lead mb-5 mx-auto" style={{ maxWidth: '600px' }}>
            Connecting Kenyan farmers to markets, experts, and opportunities.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/marketplace">
              <button className="btn btn-success btn-lg px-4 py-2 shadow">
                Buy Fresh Crops
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="btn btn-outline-light btn-lg px-4 py-2 shadow">
                Sell Your Produce
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <h2 className="display-6 fw-semibold text-center mb-5 text-success">
            Get Started with M-Farm
          </h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <div className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h3 className="card-title fw-semibold text-success mb-3">
                    Browse Marketplace
                  </h3>
                  <p className="card-text text-muted">
                    Discover fresh produce from local farmers across Kenya.
                  </p>
                  <Link to="/marketplace" className="btn btn-link text-success fw-semibold">
                    Explore Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h3 className="card-title fw-semibold text-success mb-3">
                    Consult an Expert
                  </h3>
                  <p className="card-text text-muted">
                    Get advice from agricultural experts to boost your yield.
                  </p>
                  <Link to="/experts" className="btn btn-link text-success fw-semibold">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h3 className="card-title fw-semibold text-success mb-3">
                    List Your Produce
                  </h3>
                  <p className="card-text text-muted">
                    Sell your crops directly to buyers with ease.
                  </p>
                  <Link to="/dashboard" className="btn btn-link text-success fw-semibold">
                    Start Selling
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container py-5">
          <h2 className="display-6 fw-semibold text-center mb-5 text-success">
            Why Choose M-Farm?
          </h2>
          <div className="row row-cols-1 row-cols-md-2 g-5">
            <div className="col d-flex align-items-start gap-3">
              <img
                src="https://via.placeholder.com/80?text=🌾"
                alt="Market Access"
                className="rounded-circle"
                style={{ width: '80px', height: '80px' }}
              />
              <div>
                <h3 className="fw-semibold text-dark mb-2">Market Access</h3>
                <p className="text-muted">
                  Reach buyers across Kenya without middlemen, ensuring fair prices for your produce.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
              <img
                src="https://via.placeholder.com/80?text=🧑‍🌾"
                alt="Expert Support"
                className="rounded-circle"
                style={{ width: '80px', height: '80px' }}
              />
              <div>
                <h3 className="fw-semibold text-dark mb-2">Expert Support</h3>
                <p className="text-muted">
                  Consult with agronomists and specialists to improve farming techniques.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
              <img
                src="https://via.placeholder.com/80?text=💰"
                alt="Secure Payments"
                className="rounded-circle"
                style={{ width: '80px', height: '80px' }}
              />
              <div>
                <h3 className="fw-semibold text-dark mb-2">Secure Payments</h3>
                <p className="text-muted">
                  Integrated with M-Pesa for fast, reliable transactions.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
              <img
                src="https://via.placeholder.com/80?text=📱"
                alt="Mobile Friendly"
                className="rounded-circle"
                style={{ width: '80px', height: '80px' }}
              />
              <div>
                <h3 className="fw-semibold text-dark mb-2">Mobile Friendly</h3>
                <p className="text-muted">
                  Access M-Farm anytime, anywhere from your phone or computer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5 bg-success text-white">
        <div className="container py-5 text-center">
          <h2 className="display-6 fw-semibold mb-4">
            Join the M-Farm Community Today
          </h2>
          <p className="lead mb-5">
            Whether you're a farmer, buyer, or expert, M-Farm is your platform to grow and thrive.
          </p>
          <Link to="/signup">
            <button className="btn btn-light btn-lg px-5 py-2 text-success shadow">
              Sign Up Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;