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

      <section className="py-5">
        <div className="container py-5">
          <h2 className="display-6 fw-semibold text-center mb-5 text-success">
            Why Choose M-Farm?
          </h2>
          <div className="row row-cols-1 row-cols-md-2 g-5">
            <div className="col d-flex align-items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="66" height="66" fill="currentColor" class="bi bi-basket2-fill" viewBox="0 0 16 16">
            <path d="M5.929 1.757a.5.5 0 1 0-.858-.514L2.217 6H.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h.623l1.844 6.456A.75.75 0 0 0 3.69 15h8.622a.75.75 0 0 0 .722-.544L14.877 8h.623a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1.717L10.93 1.243a.5.5 0 1 0-.858.514L12.617 6H3.383zM4 10a1 1 0 0 1 2 0v2a1 1 0 1 1-2 0zm3 0a1 1 0 0 1 2 0v2a1 1 0 1 1-2 0zm4-1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1"/>
            </svg>
              <div>
                <h3 className="fw-semibold text-dark mb-2">Market Access</h3>
                <p className="text-muted">
                  Reach buyers across Kenya without middlemen, ensuring fair prices for your produce.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="66" height="66" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
            </svg>
              <div>
                <h3 className="fw-semibold text-dark mb-2">Expert Support</h3>
                <p className="text-muted">
                  Consult with agronomists and specialists as well as an intergrated AI Chatbot to improve farming techniques.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="66" height="66" fill="currentColor" class="bi bi-currency-exchange" viewBox="0 0 16 16">
            <path d="M0 5a5 5 0 0 0 4.027 4.905 6.5 6.5 0 0 1 .544-2.073C3.695 7.536 3.132 6.864 3 5.91h-.5v-.426h.466V5.05q-.001-.07.004-.135H2.5v-.427h.511C3.236 3.24 4.213 2.5 5.681 2.5c.316 0 .59.031.819.085v.733a3.5 3.5 0 0 0-.815-.082c-.919 0-1.538.466-1.734 1.252h1.917v.427h-1.98q-.004.07-.003.147v.422h1.983v.427H3.93c.118.602.468 1.03 1.005 1.229a6.5 6.5 0 0 1 4.97-3.113A5.002 5.002 0 0 0 0 5m16 5.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0m-7.75 1.322c.069.835.746 1.485 1.964 1.562V14h.54v-.62c1.259-.086 1.996-.74 1.996-1.69 0-.865-.563-1.31-1.57-1.54l-.426-.1V8.374c.54.06.884.347.966.745h.948c-.07-.804-.779-1.433-1.914-1.502V7h-.54v.629c-1.076.103-1.808.732-1.808 1.622 0 .787.544 1.288 1.45 1.493l.358.085v1.78c-.554-.08-.92-.376-1.003-.787zm1.96-1.895c-.532-.12-.82-.364-.82-.732 0-.41.311-.719.824-.809v1.54h-.005zm.622 1.044c.645.145.943.38.943.796 0 .474-.37.8-1.02.86v-1.674z"/>
            </svg>
              <div>
                <h3 className="fw-semibold text-dark mb-2">Secure Payments</h3>
                <p className="text-muted">
                  Integrated with M-Pesa,Visa,Paypal for fast, reliable transactions.
                </p>
              </div>
            </div>
            <div className="col d-flex align-items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="66" height="66" fill="currentColor" class="bi bi-phone" viewBox="0 0 16 16">
                <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                </svg>
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