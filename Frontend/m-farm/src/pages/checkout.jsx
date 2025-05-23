import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

const Checkout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', phone: '' });
  const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const receiptRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [], totalAmount = 0 } = location.state || {};

  const [cartState, setCart] = useState(cart);
  const [totalAmountState, setTotalAmount] = useState(totalAmount);

  useEffect(() => {
    console.log('Checkout loaded. Location state:', location.state);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      toast.error('Please log in to proceed.');
      navigate('/login');
      return;
    }
    console.log('Token found:', token);

    // Load cart from sessionStorage if location.state is empty
    let loadedCart = cart;
    if (!cart.length) {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        loadedCart = parsedCart.map(item => ({
          ...item,
          quantity: parseInt(item.quantity, 10)
        }));
        setCart(loadedCart);
        setTotalAmount(loadedCart.reduce((sum, item) => sum + item.price * item.quantity, 0));
      }
    }

    // Redirect if cart is empty
    if (!loadedCart.length) {
      console.log('Cart is empty, redirecting to marketplace');
      toast.error('Your cart is empty. Add products to proceed.');
      navigate('/marketplace');
    }
  }, [navigate, cart, location.state]);

  useEffect(() => {
    console.log('Modal state:', showMpesaModal, 'Payment method:', paymentMethod);
  }, [showMpesaModal, paymentMethod]);

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const captureReceipt = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current);
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing receipt:', error);
        toast.error('Failed to generate receipt image.');
        return null;
      }
    }
    return null;
  };

  const downloadReceipt = async () => {
    const receiptImage = await captureReceipt();
    if (receiptImage) {
      const link = document.createElement('a');
      link.href = receiptImage;
      link.download = `receipt_order_${receiptData?.order_id}.png`;
      link.click();
    }
  };

  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    console.log('Payment method selected:', value);
    setPaymentMethod(value);
    if (value === 'mpesa') {
      console.log('Opening M-Pesa Bootstrap modal');
      setShowMpesaModal(true);
    } else {
      console.log('Closing M-Pesa modal');
      setShowMpesaModal(false);
      setMpesaPhone('');
    }
  };

  const validatePhoneNumber = (phone) => {
    const regex = /^\+2547\d{8}$/;
    return regex.test(phone);
  };

  const handleMpesaSubmit = async () => {
    if (!validatePhoneNumber(mpesaPhone)) {
      toast.error('Please enter a valid phone number in format +2547XXXXXXXX');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      phone_number: mpesaPhone,
      amount: totalAmountState,
      order_id: receiptData?.order_id || 0,
    };

    try {
      const response = await fetch('http://localhost:8000/mfarm/api/v1/mpesa/stk-push/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('STK Push response:', responseData);
      if (response.ok) {
        toast.success('STK Push initiated! Check your phone.');
        setShowMpesaModal(false);
        setMpesaPhone('');
      } else {
        toast.error(responseData.error || 'Failed to initiate STK Push.');
      }
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      toast.error('Error initiating STK Push. Please try again.');
    }
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
    const payload = {
      cart: cartState.map(item => ({
        product_id: item.id,
        quantity: parseInt(item.quantity, 10),
        price: item.price,
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
    };

    console.log('Checkout payload:', payload);

    try {
      const response = await fetch('http://localhost:8000/mfarm/api/v1/checkout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Checkout response:', responseData);
      if (response.ok) {
        const receiptInfo = {
          order_id: responseData.id,
          name: userDetails.name,
          products: cartState.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
          payment_method: paymentMethod,
          total_amount: responseData.total_amount,
          timestamp: new Date().toLocaleString(),
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          verify_url: `http://localhost:8000/mfarm/api/v1/order/verify/${responseData.id}/`,
        };
        setReceiptData(receiptInfo);

        setTimeout(async () => {
          const receiptImage = await captureReceipt();
          if (receiptImage) {
            const emailPayload = {
              order_id: responseData.id,
              email: userDetails.email,
              name: userDetails.name,
              receipt_image: receiptImage,
            };
            try {
              const emailResponse = await fetch('http://localhost:8000/mfarm/api/v1/send-receipt/', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload),
              });
              const emailData = await emailResponse.json();
              console.log('Email response:', emailData);
              if (!emailResponse.ok) {
                toast.error(emailData.error || 'Failed to send receipt email.');
              } else {
                toast.success('Receipt email sent!');
              }
            } catch (emailError) {
              console.error('Error sending email:', emailError);
              toast.error('Error sending receipt email.');
            }
          }
        }, 500);

        setCart([]);
        setTotalAmount(0);
        sessionStorage.removeItem('cart');
        toast.success('Order placed successfully!');
      } else {
        console.error('Checkout error:', responseData);
        toast.error(responseData.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Network error during checkout:', error);
      toast.error('Error placing order. Please try again later.');
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container py-5" style={{ maxWidth: '70%' }}>
        <h2 className="display-6 fw-semibold text-center mb-5 text-success">Checkout</h2>

        {receiptData ? (
          <div className="card shadow-sm border-0 mb-5">
            <div className="card-body" ref={receiptRef}>
              <h3 className="fw-semibold text-dark mb-4">Order Receipt</h3>
              <p><strong>Order #{receiptData.order_id}</strong><br />
              Date: {receiptData.timestamp}</p>
              <h4>Order Details</h4>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price (KES)</th>
                    <th>Total (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="fw-bold">Total</td>
                    <td className="fw-bold">{receiptData.total_amount}</td>
                  </tr>
                </tfoot>
              </table>
              <h4>Payment & Shipping</h4>
              <p>Payment Method: {receiptData.payment_method}</p>
              <p>Shipping Address: {receiptData.address}, {receiptData.city} {receiptData.postal_code}</p>
              <h4>Verify Your Order</h4>
              <p>Scan the QR code below to verify your order:</p>
              <QRCode value={receiptData.verify_url} size={150} />
            </div>
            <div className="card-footer">
              <button className="btn btn-success" onClick={downloadReceipt}>
                Download Receipt
              </button>
              <button className="btn btn-outline-success ms-3" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="card shadow-sm border-0 mb-5">
              <div className="card-body">
                <h3 className="fw-semibold text-dark mb-4">Order Summary</h3>
                {cartState.length === 0 ? (
                  <p className="text-muted">Your cart is empty. <Link to="/marketplace">Browse products</Link>.</p>
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
                          onChange={handlePaymentMethodChange}
                          checked={paymentMethod === method.id}
                          disabled={paymentMethod && paymentMethod !== method.id && paymentMethod === 'mpesa'}
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

            <div className="d-flex justify-content-between">
              <Link to="/marketplace" className="btn btn-outline-success shadow-sm">
                Back to Marketplace
              </Link>
              <button className="btn btn-success shadow-sm" onClick={handleCheckout}>
                Place Order
              </button>
            </div>
          </>
        )}

        {/* Bootstrap M-Pesa Modal */}
        {showMpesaModal && (
          <motion.div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">M-Pesa Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      console.log('Closing M-Pesa modal');
                      setShowMpesaModal(false);
                      setPaymentMethod('');
                      setMpesaPhone('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="mpesaPhone" className="form-label">
                      Enter Phone Number (+2547XXXXXXXX)
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mpesaPhone"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+2547XXXXXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      console.log('Closing M-Pesa modal');
                      setShowMpesaModal(false);
                      setPaymentMethod('');
                      setMpesaPhone('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleMpesaSubmit}
                  >
                    Initiate STK Push
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default Checkout;