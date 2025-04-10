import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2e7d32;
  color: white;
  position: relative; /* Ensure mobile menu positions correctly */
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;

  a {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    transition: color 0.3s ease;

    &:hover {
      color: #e0e0e0;
    }
  }

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%; /* Below the header */
    left: 0;
    width: 100%;
    background: #2e7d32;
    padding: 1rem;
    z-index: 1000; /* Ensure it overlays content */
  }
`;

const HamburgerButton = styled.button`
  display: none; /* Hidden by default on larger screens */
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block; /* Visible on mobile */
    transition: all 0.3s ease-in-out;
  }

  &:focus {
    outline: none;
  }
`;

const Header = ({ isOpen, toggleMenu }) => (
  <HeaderWrapper>
    <h1>M-Farm</h1>
    <Nav isOpen={isOpen}>
      <Link to="/">Home</Link>
      <Link to="/marketplace">Marketplace</Link>
      <Link to="/experts">Experts</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/login">Login</Link>
      <Link to="/signup">Sign Up</Link>
    </Nav>
    <HamburgerButton onClick={toggleMenu}>
      {isOpen ? '✕' : '☰'} {/* Toggle between hamburger and close icon */}
    </HamburgerButton>
  </HeaderWrapper>
);

export default Header;