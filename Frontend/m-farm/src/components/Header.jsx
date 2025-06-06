import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';
import { CiClock2 } from 'react-icons/ci';

// Styled components for top bar
const TopBar = styled.div`
  background-color: #f5f5f5;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #4b5563;
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const TopBarLink = styled.a`
  display: flex;
  align-items: center;
  color: #4b5563;
  text-decoration: none;

  &:hover {
    color:  #2e7d32;
  }
`;

const TopBarSpan = styled.span`
  display: flex;
  align-items: center;
  color: #4b5563;
`;

const Gab = styled(TopBarSpan)`
  margin-left: 15rem;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Gab1 = styled(TopBarLink)`
  margin-right: 15rem;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const Gab2 = styled(TopBarSpan)`
  margin-right: 5rem;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const TopBarIcon = styled.svg`
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  fill:  #2e7d32;
`;

const CiClockIcon = styled(CiClock2)`
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  fill:  #2e7d32;
`;

// Existing styled components for header
const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color:#2e7f32;
  opacity:100;
  color: white;
  position: relative;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;

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
  background-color: #2e7d32 !important;
  border: none;

  .dropdown-item {
    color: white;
    font-size: 1rem;
    padding: 0.5rem 1rem;

    &:hover {
      background-color: #1b5e20;
      color: #e0e0e0;
    }

    &:active {
      background-color: #1b5e20;
      color: white;
    }
  }
`;

const Header = ({ isOpen, toggleMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

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
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      };
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('http://localhost:8001/accounts/api/v1/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
    }

    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/');
    }, 3000);
  };

  return (
    <>
      <TopBar>
        <Gab>
          <TopBarIcon viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </TopBarIcon>
          Nairobi,Kenya
        </Gab>
        <Gab1 href="https://www.mfarm.co.ke">
          <TopBarIcon viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </TopBarIcon>
          www.mfarm.co.ke
        </Gab1>
        <Gab2>
          <CiClockIcon />
          Mon - Saturday, 8am - 8pm
        </Gab2>
      </TopBar>
      <HeaderWrapper>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>M-Farm</h1>
        </Link>
        <Nav isOpen={isOpen}>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/experts">Experts</Link>
          <Link to="/dashboard">Dashboard</Link>
          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Toggle as="div" id="profile-dropdown">
                {userProfile && userProfile.photo ? (
                  <ProfileImage src={userProfile.photo} alt="Profile" />
                ) : (
                  <PlaceholderImage />
                )}
              </Dropdown.Toggle>
              <StyledDropdownMenu align="end">
                <Dropdown.Item as={Link} to="/profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </StyledDropdownMenu>
            </Dropdown>
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