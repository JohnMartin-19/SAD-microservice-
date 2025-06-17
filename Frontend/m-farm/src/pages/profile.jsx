// src/pages/Profile.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Header from '../components/Header';

import { useTheme } from '../ThemeContext';
// If you're using usePageHeaderTheme from App.jsx, ensure it's imported:
// import { usePageHeaderTheme } from '../App';


const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    phone: '',
    bio: '',
    location: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { themeMode, toggleTheme } = useTheme();
  

  const fetchProfileData = useCallback(async (token) => {
    try {
     
      const response = await fetch(`http://127.0.0.1:8001/accounts/api/v1/profile/`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch error:', errorData);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }

        throw new Error(errorData.detail || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log("logged in user",data)
      setProfile(data);
     
      setPhotoPreview(data.photo ? `http://127.0.0.1:8001${data.photo}` : null);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
    }
  }, [navigate, setProfile, setPhotoPreview, setError]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetchProfileData(token);
    } else {
      navigate('/login', { replace: true });
    }
  }, [fetchProfileData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please log in.');
      navigate('/login', { replace: true });
      return;
    }

    const formData = new FormData();
    formData.append('first_name', profile.first_name || '');
    formData.append('email', profile.email || '');
    formData.append('phone', profile.phone || '');
    formData.append('bio', profile.bio || '');
    formData.append('location', profile.location || '');
    if (profile.photo instanceof File) {
      formData.append('photo', profile.photo);
    }

    try {
      const response = await fetch(`http://127.0.0.1:8001/accounts/api/v1/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update error:', errorData);
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setPhotoPreview(updatedProfile.photo ? `${process.env.ACCOUNTS_REACT_APP_API_BASE_URL}${updatedProfile.photo}` : null);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Save error:', err.message);
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please log in.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await fetch(`${process.env.ACCOUNTS_REACT_APP_API_BASE_URL}/accounts/api/v1/profile/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete error:', errorData);
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }
        throw new Error(errorData.detail || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Delete error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: themeMode === 'dark' ? '#121212' : '#f0f2f5', color: themeMode === 'dark' ? 'white' : '#333' }}>
      <Header
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        toggleTheme={toggleTheme}
        themeMode={themeMode}
       
      />

      <motion.div
        className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{ paddingTop: '5rem' }}
      >
        <motion.div
          className="card shadow-lg border-0"
          style={{ maxWidth: '100%', width: '100%', minHeight: '70vh',
                   backgroundColor: themeMode === 'dark' ? '#1e1e1e' : 'white',
                   color: themeMode === 'dark' ? 'white' : '#333'
                }}
          variants={scaleUp}
        >
          <div className="card-body p-5">
            <motion.h2
              className="display-6 fw-semibold text-center mb-5"
              variants={fadeInUp}
              style={{ color: themeMode === 'dark' ? '#4CAF50' : '#2e7d32' }}
            >
              Your Profile
            </motion.h2>

            {error && (
              <motion.div className="alert alert-danger" variants={fadeInUp}>
                {error}
              </motion.div>
            )}

            <div className="row g-4">
              <div className="col-md-4 text-center">
                <motion.div
                  className="mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={photoPreview || 'https://via.placeholder.com/150?text=Profile'}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="col-md-8">
                <motion.div variants={staggerChildren} initial="hidden" animate="visible">
                  {isEditing ? (
                    <>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Name</label>
                        <input
                          type="text"
                          name="first_name"
                          className="form-control"
                          value={profile.first_name || ''}
                          onChange={handleInputChange}
                          style={{
                              backgroundColor: themeMode === 'dark' ? '#333' : 'white',
                              color: themeMode === 'dark' ? 'white' : '#333',
                              borderColor: themeMode === 'dark' ? '#555' : '#ccc'
                          }}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={profile.email || ''}
                          onChange={handleInputChange}
                          style={{
                              backgroundColor: themeMode === 'dark' ? '#333' : 'white',
                              color: themeMode === 'dark' ? 'white' : '#333',
                              borderColor: themeMode === 'dark' ? '#555' : '#ccc'
                          }}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={profile.phone || ''}
                          onChange={handleInputChange}
                           style={{
                              backgroundColor: themeMode === 'dark' ? '#333' : 'white',
                              color: themeMode === 'dark' ? 'white' : '#333',
                              borderColor: themeMode === 'dark' ? '#555' : '#ccc'
                          }}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Bio</label>
                        <textarea
                          name="bio"
                          className="form-control"
                          rows="3"
                          value={profile.bio || ''}
                          onChange={handleInputChange}
                           style={{
                              backgroundColor: themeMode === 'dark' ? '#333' : 'white',
                              color: themeMode === 'dark' ? 'white' : '#333',
                              borderColor: themeMode === 'dark' ? '#555' : '#ccc'
                          }}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Location</label>
                        <input
                          type="text"
                          name="location"
                          className="form-control"
                          value={profile.location || ''}
                          onChange={handleInputChange}
                           style={{
                              backgroundColor: themeMode === 'dark' ? '#333' : 'white',
                              color: themeMode === 'dark' ? 'white' : '#333',
                              borderColor: themeMode === 'dark' ? '#555' : '#ccc'
                          }}
                        />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.p variants={fadeInUp}><strong style={{color: themeMode === 'dark' ? '#99cc99' : '#1B5E20'}}>Name:</strong> {profile.first_name || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong style={{color: themeMode === 'dark' ? '#99cc99' : '#1B5E20'}}>Email:</strong> {profile.email || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong style={{color: themeMode === 'dark' ? '#99cc99' : '#1B5E20'}}>Phone:</strong> {profile.phone || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong style={{color: themeMode === 'dark' ? '#99cc99' : '#1B5E20'}}>Bio:</strong> {profile.bio || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong style={{color: themeMode === 'dark' ? '#99cc99' : '#1B5E20'}}>Location:</strong> {profile.location || 'N/A'}</motion.p>
                      <br />
                      <br />
                    </>
                  )}
                </motion.div>

                <motion.div className="d-flex gap-3 mt-4" variants={fadeInUp}>
                  {isEditing ? (
                    <>
                      <button
                        className="btn btn-success shadow-sm w-50"
                        onClick={handleSave}
                        style={{
                            backgroundColor: themeMode === 'dark' ? '#4CAF50' : '#2e7d32',
                            borderColor: themeMode === 'dark' ? '#4CAF50' : '#2e7d32',
                            color: 'white'
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        className="btn btn-outline-secondary shadow-sm w-50"
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfileData(localStorage.getItem('token'));
                        }}
                        style={{
                            color: themeMode === 'dark' ? 'white' : '#6c757d',
                            borderColor: themeMode === 'dark' ? '#6c757d' : '#6c757d',
                            backgroundColor: 'transparent'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-success shadow-sm w-50"
                        onClick={() => setIsEditing(true)}
                        style={{
                            backgroundColor: themeMode === 'dark' ? '#4CAF50' : '#2e7d32',
                            borderColor: themeMode === 'dark' ? '#4CAF50' : '#2e7d32',
                            color: 'white'
                        }}
                      >
                        Edit Profile
                      </button>
                      <button
                        className="btn btn-outline-danger shadow-sm w-50"
                        onClick={handleDeleteAccount}
                        style={{
                            color: themeMode === 'dark' ? '#dc3545' : '#dc3545',
                            borderColor: themeMode === 'dark' ? '#dc3545' : '#dc3545',
                            backgroundColor: 'transparent'
                        }}
                      >
                        Delete Account
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;