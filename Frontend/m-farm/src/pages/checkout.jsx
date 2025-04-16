import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

const Checkout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', phone: '' });
  const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [], totalAmount = 0 } = location.state || {};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      toast.error('Please log in to proceed.');
      navigate('/login');
    } else {
      console.log('Token found:', token);
    }

    if (!cart.length) {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const sanitizedCart = parsedCart.map(item => ({
          ...item,
          quantity: parseInt(item.quantity, 10)
        }));
        setCart(sanitizedCart);
        setTotalAmount(sanitizedCart.reduce((sum, item) => sum + item.price * item.quantity, 0));
      }
    }
  }, [navigate]);

  const [cartState, setCart] = useState(cart);
  const [totalAmountState, setTotalAmount] = useState(totalAmount);

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
        setReceiptData({
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
        });

        const receiptImage = await captureReceipt();
        if (receiptImage) {
          const emailPayload = {
            ...payload,
            receipt_image: receiptImage,
          };
          await fetch('http://localhost:8000/mfarm/api/v1/checkout/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          });
        }

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
      </div>

    </div>
  );
};

export default Checkout;