// Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';
import {
  FaHome, FaShoppingBasket, FaUserTie, FaChartBar,
  FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt,
  FaBars, FaTimes, FaSun, FaMoon // Added Sun and Moon icons for theme toggle
} from 'react-icons/fa';

// Import useTheme hook
import { useTheme } from '../ThemeContext'; // Adjust path if necessary
// Import usePageHeaderTheme hook
import { usePageHeaderTheme } from '../App'; // Adjust path if App.jsx is not in parent directory

// --- Styled Components ---

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: transparent;
  z-index: 1000;
  transition: background-color 0.3s ease;
`;

const Logo = styled(Link)`
  text-decoration: none;
  h1 {
    margin: 0;
    font-size: 2rem;
    line-height: 1;
    /* Adaptive Logo Color */
    color: ${props => {
      // If dark mode is active, override with dark mode color from theme
      if (props.currentAppTheme === 'dark') return props.theme.headerLogo;
      // Else, use page-specific color
      return props.pageHeaderTheme === 'dark-background' ? 'white' : props.theme.primaryGreen;
    }};
  }
  z-index: 1001;
`;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background-color: ${props => props.theme.navMenuBg}; /* Use theme for nav menu background */
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-out;
  transform: translateX(${props => (props.isOpen ? '0%' : '100%')});
  z-index: 1500;
  overflow-y: auto;

  a, button {
    color: ${props => props.theme.navMenuText}; /* Use theme for nav menu text */
    text-decoration: none;
    font-size: 1.2rem;
    padding: 0.8rem 0;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;

    &:hover {
      color: #e0e0e0;
    }
  }

  .dropdown {
    width: 100%;
    .dropdown-toggle {
      width: 100%;
      justify-content: flex-start;
      padding: 0.8rem 0;
    }
  }
`;

const NavLinkContent = styled.span`
  margin-left: 0.5rem;
`;

const HamburgerButton = styled.button`
  display: block;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1501;
  transition: transform 0.3s ease;

  /* Adaptive Hamburger Color */
  color: ${props => {
    // If dark mode is active, override with dark mode color from theme
    if (props.currentAppTheme === 'dark') return props.theme.headerHamburger;
    // Else, use page-specific color
    return props.pageHeaderTheme === 'dark-background' ? 'white' : props.theme.primaryGreen;
  }};

  ${props => props.isOpen && css`
    position: fixed;
    top: 1rem;
    right: 1rem;
    color: ${props => props.theme.navMenuText}; /* Close icon color should match menu text */
  `}
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => {
    // Theme toggle icon color should adapt like hamburger, but also consider menu state
    if (props.isOpen) return props.theme.navMenuText; // When menu is open, use menu text color
    if (props.currentAppTheme === 'dark') return props.theme.headerHamburger; // Dark mode active
    return props.pageHeaderTheme === 'dark-background' ? 'white' : props.theme.primaryGreen; // Page specific
  }};
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem; /* Space from hamburger */
  z-index: 1501; /* Same as hamburger */
`;


const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => (props.show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const OverlayMessage = styled.p`
  color: white;
  font-size: 1.5rem;
  background: ${props => props.theme.primaryGreen}; /* Use theme color */
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid white;

  &:hover {
    border-color: #e0e0e0;
  }
`;

const PlaceholderImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid white;
  cursor: pointer;

  &:hover {
    border-color: #e0e0e0;
  }
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
  background-color: ${props => props.theme.secondaryGreen} !important; /* Use theme color */
  border: none;
  position: static !important;
  transform: none !important;
  margin-top: 0.5rem;
  width: 100%;

  .dropdown-item {
    color: white;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;

    &:hover {
      background-color: ${props => props.theme.primaryGreen}; /* Use theme color */
      color: #e0e0e0;
    }

    &:active {
      background-color: ${props => props.theme.primaryGreen};
      color: white;
    }
  }
`;


const Header = ({ isOpen, toggleMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const { theme: currentAppTheme, toggleTheme } = useTheme();
 
  const pageHeaderTheme = usePageHeaderTheme();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('http://localhost:8001/accounts/api/v1/profile/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
          } else {
            console.error('Failed to fetch profile');
            localStorage.removeItem('token');
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          localStorage.removeItem('token');
          setUserProfile(null);
        }
      };
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    let token = localStorage.getItem("token")
    setIsLoggingOut(true);
    try {
      await fetch('http://localhost:8001/accounts/api/v1/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      setUserProfile(null);
    }

    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/');
    }, 3000);
  };

  return (
    <>
      <HeaderWrapper>
      
        <Logo to="/" pageHeaderTheme={pageHeaderTheme} currentAppTheme={currentAppTheme}>
          <h1>M-Farm</h1>
        </Logo>

     
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggleButton onClick={toggleTheme} pageHeaderTheme={pageHeaderTheme} currentAppTheme={currentAppTheme} isOpen={isOpen}>
            {currentAppTheme === 'light' ? <FaMoon /> : <FaSun />}
          </ThemeToggleButton>

       
          <HamburgerButton onClick={toggleMenu} isOpen={isOpen} pageHeaderTheme={pageHeaderTheme} currentAppTheme={currentAppTheme}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </HamburgerButton>
        </div>

       
        <Nav isOpen={isOpen}>
          <Link to="/" onClick={toggleMenu}>
            <FaHome />
            <NavLinkContent>Home</NavLinkContent>
          </Link>
          <Link to="/marketplace" onClick={toggleMenu}>
            <FaShoppingBasket />
            <NavLinkContent>Marketplace</NavLinkContent>
          </Link>
          <Link to="/experts" onClick={toggleMenu}>
            <FaUserTie />
            <NavLinkContent>Experts</NavLinkContent>
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={toggleMenu}>
              <FaChartBar />
              <NavLinkContent>Dashboard</NavLinkContent>
            </Link>
          )}

          {isAuthenticated ? (
            <Dropdown className="w-100">
              <Dropdown.Toggle as="div" id="profile-dropdown">
                {userProfile && userProfile.photo ? (
                  <ProfileImage src={userProfile.photo} alt="Profile" />
                ) : (
                  <PlaceholderImage />
                )}
                <NavLinkContent>{userProfile?.first_name || 'Profile'}</NavLinkContent>
              </Dropdown.Toggle>
              <StyledDropdownMenu align="start">
                <Dropdown.Item as={Link} to="/profile" onClick={toggleMenu}>
                  <FaUser style={{ marginRight: '0.5rem' }} />
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={() => { handleLogout(); toggleMenu(); }}>
                  <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
                  Logout
                </Dropdown.Item>
              </StyledDropdownMenu>
            </Dropdown>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu}>
                <FaSignInAlt />
                <NavLinkContent>Login</NavLinkContent>
              </Link>
              <Link to="/signup" onClick={toggleMenu}>
                <FaUserPlus />
                <NavLinkContent>Sign Up</NavLinkContent>
              </Link>
            </>
          )}
        </Nav>
      </HeaderWrapper>

      {isLoggingOut && (
        <Overlay show={isLoggingOut}>
          <OverlayMessage>Logging you out, wait a min...</OverlayMessage>
        </Overlay>
      )}
    </>
  );
};

export default Header;