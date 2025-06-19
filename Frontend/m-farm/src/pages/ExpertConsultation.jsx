import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ExpertConsultation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  
  const experts = [
    { id: 1, name: 'Dr. Kamau', specialty: 'Crop Disease Management', rate: 'KES 500' },
    { id: 2, name: 'Prof. Achieng', specialty: 'Soil Fertility', rate: 'KES 500' },
  ];

  // Check authentication status
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; 

  };

 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBookNow = (expert) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to book a consultation.');
      setTimeout(()=> {
        navigate('/login');
      },3000)
      return;
    }
    setSelectedExpert(expert);
    setModalVisible(true);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

   
    setChatMessages([...chatMessages, { text: chatInput, isUser: true }]);
    setIsChatLoading(true);
    setChatInput(''); 

    try {
      
      const response = await fetch('http://localhost:8000/mfarm/api/v1/ai-chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
         
        },
        body: JSON.stringify({ prompt: chatInput }),
      });

     
      if (!response.ok) {
        const errorData = await response.json();
       
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

   
      const aiResponse = data.response || 'Sorry, I couldn’t process that. Please try again.';

      setChatMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error('AI API error:', error);
     
      setChatMessages(prev => [
        ...prev,
        { text: `Error connecting to AI assistant: ${error.message}. Please try again.`, isUser: false },
      ]);
    } finally {
      setIsChatLoading(false);
    
    }
  };

  const handlePayment = () => {
   
    alert(`Payment of ${selectedExpert?.rate} to M-Pesa for ${selectedExpert?.name} consultation confirmed!`);
    setModalVisible(false);
    setBookingDate('');
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Content */}
      <div className="container py-5" style={{ maxWidth: '70%' }}>
        {/* Expert List */}
        <h2 className="display-6 fw-semibold text-center mb-5 text-success">
          Consult an Expert
        </h2>
        <div className="row row-cols-1 row-cols-md-2 g-4 mb-5">
          {experts.map(expert => (
            <div key={expert.id} className="col">
              <div className="card h-100 shadow-sm border-0 text-center">
                <div className="card-body">
                  <h3 className="card-title fw-semibold text-dark">{expert.name}</h3>
                  <p className="card-text text-muted">{expert.specialty}</p>
                  <p className="card-text text-muted">{expert.rate}</p>
                  <button
                    className="btn btn-success shadow-sm w-100"
                    onClick={() => handleBookNow(expert)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
          <br />
          <br />
          <br />
        {/* Chatbot Interface */}
        <h2 className="display-6 fw-semibold text-center mb-5 text-success">
          Ask Our AI Expert Assistant
        </h2>
        <div className="card shadow-sm border-0">
          <div className="card-body d-flex flex-column" style={{ height: '400px' }}>
            <div
              className="flex-grow-1 overflow-auto mb-3 p-3"
              style={{ backgroundColor: '#f9f9f9', borderRadius: '5px' }}
            >
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex ${msg.isUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}
                >
                  <div
                    className={`p-2 rounded ${msg.isUser ? 'bg-success text-white' : 'bg-light text-dark'}`}
                    style={{ maxWidth: '70%' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="d-flex justify-content-start mb-2">
                  <div className="p-2 rounded bg-light text-dark" style={{ maxWidth: '70%' }}>
                    Consolidating your response...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about crops, soil, pests, etc."
                disabled={isChatLoading}
              />
              <button type="submit" className="btn btn-success shadow-sm" disabled={isChatLoading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-up"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {modalVisible && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
        >
          <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="card-body">
              <h3 className="fw-semibold text-dark mb-3">Book {selectedExpert?.name}</h3>
              <p className="text-muted">Specialty: {selectedExpert?.specialty}</p>
              <div className="mb-3">
                <label className="form-label">Select Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <p className="text-muted">Cost: {selectedExpert?.rate}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-success shadow-sm w-100" onClick={handlePayment}>
                  Pay with M-Pesa
                </button>
                <button
                  className="btn btn-outline-secondary shadow-sm w-100"
                  onClick={() => setModalVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpertConsultation;