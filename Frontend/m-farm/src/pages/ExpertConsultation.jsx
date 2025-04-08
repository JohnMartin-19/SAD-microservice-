import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
// Add styled-components for cards, modal, chat
// State for expert list, modal visibility, chat messages
// Expert cards with "Book Now" buttons
// Modal with calendar and M-Pesa payment option
// Simple chat UI
const ExpertConsultation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      {/* Expert List */}
      {/* Booking Modal */}
      {/* Chat Interface */}
      <div>
        consult an expert
      </div>
      <Footer />
    </>
  );
};
export default ExpertConsultation;