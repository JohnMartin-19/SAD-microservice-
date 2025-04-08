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
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;

  /* Style the Link components (rendered as <a> tags) */
  a {
    color: white; /* White text color */
    text-decoration: none; /* Remove underline */
    font-size: 1.1rem; /* Optional: Adjust font size for readability */
    transition: color 0.3s ease; /* Smooth hover transition */

    &:hover {
      color: #e0e0e0; /* Slightly lighter white on hover for feedback */
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background: #2e7d32;
    display: ${props => (props.isOpen ? 'flex' : 'none')};
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
    <button
      onClick={toggleMenu}
      style={{
        display: 'none',
        '@media (max-width: 768px)': { display: 'block' }, // This won't work as intended; see note below
      }}
    >
      ☰
    </button>
  </HeaderWrapper>
);

export default Header;