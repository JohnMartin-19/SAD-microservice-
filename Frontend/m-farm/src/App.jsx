// src/App.jsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; // <-- IMPORT PrivateRoute

// page components
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import ExpertConsultation from './pages/ExpertConsultation';
import Signup from './pages/sign_up';
import Login from './pages/login';
import Checkout from './pages/checkout';
import Profile from './pages/profile';

// Assuming ThemeContext.js is in src/ThemeContext.js or similar
import { ThemeProvider, useTheme } from './ThemeContext';

const GlobalLayoutStyles = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  body {
    background-color: ${({ theme }) => theme.bodyBackground};
    color: ${({ theme }) => theme.headerText};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

const PageHeaderThemeContext = createContext('dark-background');
export const usePageHeaderTheme = () => useContext(PageHeaderThemeContext);

const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
`;

function AppContent() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [pageHeaderTheme, setPageHeaderTheme] = useState('dark-background');

  const { currentTheme, toggleTheme, themeMode } = useTheme();

  const toggleNavMenu = () => {
    setIsNavOpen(prev => !prev);
  };

  const location = useLocation();

  useEffect(() => {
    const whiteBackgroundPages = ['/marketplace', '/checkout', '/signup', '/login', '/experts', '/dashboard', '/profile'];
    if (whiteBackgroundPages.includes(location.pathname)) {
      setPageHeaderTheme('light-background');
    } else {
      setPageHeaderTheme('dark-background');
    }
  }, [location.pathname]);

  return (
    <AppContainer>
      <GlobalLayoutStyles theme={currentTheme} />

      <PageHeaderThemeContext.Provider value={pageHeaderTheme}>
        <Header
          isOpen={isNavOpen}
          toggleMenu={toggleNavMenu}
          toggleTheme={toggleTheme}
          themeMode={themeMode}
        />
      </PageHeaderThemeContext.Provider>

      {isNavOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1400,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onClick={toggleNavMenu}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/experts" element={<ExpertConsultation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* --- PROTECTED ROUTES --- */}
        {/* All routes nested here will require authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* ------------------------ */}

      </Routes>
    </AppContainer>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;