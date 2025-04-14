import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', phone: '' });
  const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get cart and total from Marketplace via state
  const { cart = [], totalAmount = 0 } = location.state || {};

  // Load cart from sessionStorage if state is unavailable
  useEffect(() => {
    if (!cart.length) {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        setTotalAmount(parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0));
      }
    }
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [cartState, setCart] = useState(cart);
  const [totalAmountState, setTotalAmount] = useState(totalAmount);

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!policyAccepted) {
      toast.error('Please accept the company policy to proceed.');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }
    if (!userDetails.name || !userDetails.email || !userDetails.phone || !shippingAddress.address) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/mfarm/api/v1/checkout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartState.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price:item.price
          })),
          payment_method: paymentMethod,
          user_details: {
            name: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone,
          },
          shipping_address: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
          },
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setCart([]);
        setTotalAmount(0);
        sessionStorage.removeItem('cart');
        toast.success('Order placed successfully!');
        setTimeout(()=>{
          navigate('/marketplace');
        },3000)
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to place order.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Error placing order. Please try again.');
    }
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Content */}
      <div className="container py-5" style={{ maxWidth: '70%' }}>
        <h2 className="display-6 fw-semibold text-center mb-5 text-success">Checkout</h2>

        {/* Cart Summary */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Order Summary</h3>
            {cartState.length === 0 ? (
              <p className="text-muted">Your cart is empty.</p>
            ) : (
              <>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartState.map(item => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>KES {item.price}</td>
                        <td>{item.quantity}</td>
                        <td>KES {item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h4 className="fw-semibold text-end">Total: KES {totalAmountState}</h4>
              </>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">User Details</h3>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Full Name"
                  value={userDetails.name}
                  onChange={e => handleInputChange(e, setUserDetails)}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  value={userDetails.email}
                  onChange={e => handleInputChange(e, setUserDetails)}
                  required
                />
              </div>
              <div className="col-12">
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Phone Number (e.g., +2547XXXXXXXX)"
                  value={userDetails.phone}
                  onChange={e => handleInputChange(e, setUserDetails)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Shipping Address</h3>
            <div className="row g-3">
              <div className="col-12">
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Street Address"
                  value={shippingAddress.address}
                  onChange={e => handleInputChange(e, setShippingAddress)}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={e => handleInputChange(e, setShippingAddress)}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="postalCode"
                  className="form-control"
                  placeholder="Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={e => handleInputChange(e, setShippingAddress)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h3 className="fw-semibold text-dark mb-4">Payment Method</h3>
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {[
                { id: 'mpesa', label: 'M-Pesa (Daraja C2B)' },
                { id: 'paypal', label: 'PayPal' },
                { id: 'visa', label: 'Visa Cards' },
                { id: 'venmo', label: 'Venmo' },
                { id: 'googlepay', label: 'Google Pay' },
                { id: 'jambopay', label: 'Jambopay Wallet' },
                { id: 'pesapal', label: 'Pesapal' },
              ].map(method => (
                <div key={method.id} className="col">
                  <div className="form-check">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      className="form-check-input"
                      onChange={e => setPaymentMethod(e.target.value)}
                      checked={paymentMethod === method.id}
                    />
                    <label htmlFor={method.id} className="form-check-label">
                      {method.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Acceptance */}
        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              id="policy"
              className="form-check-input"
              checked={policyAccepted}
              onChange={e => setPolicyAccepted(e.target.checked)}
            />
            <label htmlFor="policy" className="form-check-label">
              I accept the <Link to="/policy" className="text-success">company policy</Link>.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between">
          <Link to="/marketplace" className="btn btn-outline-success shadow-sm">
            Back to Marketplace
          </Link>
          <button className="btn btn-success shadow-sm" onClick={handleCheckout}>
            Place Order
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default Checkout;