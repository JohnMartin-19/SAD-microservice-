import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import ExpertConsultation from './pages/ExpertConsultation';
import Signup from './pages/sign_up'
import Login from './pages/login'
import Checkout from './pages/checkout'

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/dashboard" element={<FarmerDashboard />} />
      <Route path="/experts" element={<ExpertConsultation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/checkout" element={<Checkout />} />
      
    </Routes>
  </Router>
);

export default App;