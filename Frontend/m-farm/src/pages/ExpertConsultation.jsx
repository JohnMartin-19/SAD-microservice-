import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ExpertConsultation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const chatEndRef = useRef(null); // For auto-scrolling chat

  // Mock expert data (replace with API data)
  const experts = [
    { id: 1, name: 'Dr. Kamau', specialty: 'Crop Disease Management', rate: 'KES 500' },
    { id: 2, name: 'Prof. Achieng', specialty: 'Soil Fertility', rate: 'KES 500' },
  ];

  // Mock knowledge base for chatbot (simulating multiple AI agents)
  const knowledgeBase = {
    'crop disease': 'For crop diseases, ensure proper spacing and use organic fungicides. Expert Dr. Kamau suggests neem oil for fungal issues.',
    'soil fertility': 'Test soil pH and add compost or fertilizers. Prof. Achieng recommends a 6.5 pH for optimal growth.',
    'pests': 'Integrated Pest Management (IPM) is key. Use traps and beneficial insects. Aggregated from pest control agents.',
    default: 'I’m combining insights from our expert AI agents. Please specify your question (e.g., crop disease, soil fertility, pests).',
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBookNow = (expert) => {
    setSelectedExpert(expert);
    setModalVisible(true);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages([...chatMessages, { text: chatInput, isUser: true }]);

    // Simulate AI response from knowledge base
    const lowerInput = chatInput.toLowerCase();
    const response = knowledgeBase[
      Object.keys(knowledgeBase).find(key => lowerInput.includes(key)) || 'default'
    ];

    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 1000); // Simulate delay

    setChatInput('');
  };

  const handlePayment = () => {
    alert(`Payment of ${selectedExpert?.rate} to M-Pesa for ${selectedExpert?.name} consultation confirmed!`);
    setModalVisible(false);
    setBookingDate('');
  };

  return (
    <div className="text-gray-800">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

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
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about crops, soil, pests, etc."
              />
              <button type="submit" className="btn btn-success shadow-sm">
                Send
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