// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }
    fetchProfileData(token);
  }, [navigate]);

  const fetchProfileData = async (token, retryCount = 0) => {
    try {
      const response = await fetch('http://localhost:8001/accounts/api/v1/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch error:', errorData);
        if (retryCount < 3) {
          const waitTime = 1000 * (retryCount + 1); // Exponential backoff: 1s, 2s, 3s
          console.log(`Rate limited, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return fetchProfileData(token, retryCount + 1);
        }
        throw new Error('Request was throttled. Please try again later.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setLoading(false);
      toast.error(err.message);
      if (err.message.includes('throttled')) {
        setTimeout(() => navigate('/login'), 3000); // Delay redirect for throttled errors
      } else {
        navigate('/login');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setProfile(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <UserContext.Provider value={{ profile, loading, fetchProfileData, logout }}>
      {children}
    </UserContext.Provider>
  );
};