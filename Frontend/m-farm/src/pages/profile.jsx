import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';

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

  // Animation variants
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

  // Fetch profile data on mount
  useEffect(() => {
    const token = localStorage.getItem('token'); // Fixed to access_token for JWT
    console.log('Logged in user token:', token);
    if (!token) {
      navigate('/login');
    } else {
      fetchProfileData(token);
    }
  }, [navigate]);

  const fetchProfileData = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/accounts/api/v1/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setPhotoPreview(data.photo ? `http://localhost:8000${data.photo}` : null);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
      navigate('/login');
    }
  };

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
    const formData = new FormData();
    formData.append('first_name', profile.first_name || '');
    formData.append('email', profile.email || '');
    formData.append('phone', profile.phone || '');
    formData.append('bio', profile.bio || '');
    formData.append('location', profile.location || '');
    if (profile.photo && typeof profile.photo !== 'string') {
      formData.append('photo', profile.photo);
    }

    try {
      const response = await fetch('http://localhost:8000/accounts/api/v1/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update error:', errorData);
        throw new Error(errorData.errors || 'Failed to update profile');
      }
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setPhotoPreview(updatedProfile.photo ? `http://localhost:8000${updatedProfile.photo}` : null);
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
    try {
      const response = await fetch('http://localhost:8000/accounts/api/v1/profile/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete error:', errorData);
        throw new Error(errorData.detail || 'Failed to delete account');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } catch (err) {
      console.error('Delete error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="text-gray-800 min-vh-100 d-flex flex-column">
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Main Content */}
      <motion.div
        className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div
          className="card shadow-lg border-0"
          style={{ maxWidth: '100%', width: '100%', minHeight: '70vh' }}
          variants={scaleUp}
        >
          <div className="card-body p-5">
            <motion.h2
              className="display-6 fw-semibold text-center mb-5 text-success"
              variants={fadeInUp}
            >
              Your Profile
            </motion.h2>

            {error && (
              <motion.div className="alert alert-danger" variants={fadeInUp}>
                {error}
              </motion.div>
            )}

            <div className="row g-4">
              {/* Profile Photo */}
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

              {/* Profile Details */}
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
                        />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.p variants={fadeInUp}><strong>Name:</strong> {profile.first_name || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong>Email:</strong> {profile.email || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong>Phone:</strong> {profile.phone || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong>Bio:</strong> {profile.bio || 'N/A'}</motion.p>
                      <br />
                      <motion.p variants={fadeInUp}><strong>Location:</strong> {profile.location || 'N/A'}</motion.p>
                      <br />
                      <br />
                    </>
                  )}
                </motion.div>

                {/* Buttons */}
                <motion.div className="d-flex gap-3 mt-4" variants={fadeInUp}>
                  {isEditing ? (
                    <>
                      <button
                        className="btn btn-success shadow-sm w-50"
                        onClick={handleSave}
                      >
                        Save Changes
                      </button>
                      <button
                        className="btn btn-outline-secondary shadow-sm w-50"
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfileData(localStorage.getItem('token')); // Reset form
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
                      >
                        Edit Profile
                      </button>
                      <button
                        className="btn btn-outline-danger shadow-sm w-50"
                        onClick={handleDeleteAccount}
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