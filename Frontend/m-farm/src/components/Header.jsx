import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2e7d32;
  color: white;
  position: relative;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;

  a, button {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: #e0e0e0;
    }
  }

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #2e7d32;
    padding: 1rem;
    z-index: 1000;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
    transition: all 0.3s ease-in-out;
  }

  &:focus {
    outline: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const OverlayMessage = styled.p`
  color: white;
  font-size: 1.5rem;
  background: #2e7d32;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
`;

const Header = ({ isOpen, toggleMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token exists

  const handleLogout = async () => {
    setIsLoggingOut(true); // Show overlay
    try {
      await fetch('http://localhost:8000/accounts/api/v1/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      localStorage.removeItem('token'); // Remove token regardless of response
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token'); // Remove token even if API fails
    }

    // Wait 5 seconds before redirecting
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/');
    }, 3000); // 5000ms = 5 seconds
  };

  return (
    <>
      <HeaderWrapper>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>M-Farm</h1>
        </Link>
        <Nav isOpen={isOpen}>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/experts">Experts</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          {isAuthenticated ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </Nav>
        <HamburgerButton onClick={toggleMenu}>
          {isOpen ? '✕' : '☰'}
        </HamburgerButton>
      </HeaderWrapper>
      {isLoggingOut && (
        <Overlay>
          <OverlayMessage>Logging you out, wait a min...</OverlayMessage>
        </Overlay>
      )}
    </>
  );
};

export default Header;