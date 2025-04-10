import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254712345678',
    bio: 'A passionate farmer from Nakuru, specializing in organic crops.',
    location: 'Nakuru, Kenya',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
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
        staggerChildren: 0.2, // Stagger child animations by 0.2s
      },
    },
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/profile');
    } else {
      fetchProfileData();
    }
  }, [navigate]);

  const fetchProfileData = () => {
    const savedProfile = sessionStorage.getItem('profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setPhotoPreview(JSON.parse(savedProfile).photo);
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

  const handleSave = () => {
    sessionStorage.setItem('profile', JSON.stringify(profile));
    setIsEditing(false);
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
                          name="name"
                          className="form-control"
                          value={profile.name}
                          onChange={handleInputChange}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={profile.email}
                          onChange={handleInputChange}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={profile.phone}
                          onChange={handleInputChange}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Bio</label>
                        <textarea
                          name="bio"
                          className="form-control"
                          rows="3"
                          value={profile.bio}
                          onChange={handleInputChange}
                        />
                      </motion.div>
                      <motion.div className="mb-3" variants={fadeInUp}>
                        <label className="form-label fw-semibold">Location</label>
                        <input
                          type="text"
                          name="location"
                          className="form-control"
                          value={profile.location}
                          onChange={handleInputChange}
                        />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.p variants={fadeInUp}><strong>Name:</strong> {profile.name}</motion.p>
                      <motion.p variants={fadeInUp}><strong>Email:</strong> {profile.email}</motion.p>
                      <motion.p variants={fadeInUp}><strong>Phone:</strong> {profile.phone}</motion.p>
                      <motion.p variants={fadeInUp}><strong>Bio:</strong> {profile.bio}</motion.p>
                      <motion.p variants={fadeInUp}><strong>Location:</strong> {profile.location}</motion.p>
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
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-success shadow-sm w-100"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
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