import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 80vh;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  gap: 1rem;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #1b5e20;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #2e7d32;
  font-size: 1rem;
  text-align: center;
`;

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Fixed useState syntax
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for button state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Switch button to "Logging in..."
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success

    try {
      const response = await fetch('http://localhost:8000/accounts/api/v1/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.status === 200) {
        localStorage.setItem('token', data.token); // Store token
        setSuccess('You have been logged in! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard'); // Redirect after 2 seconds
          setIsSubmitting(false); // Reset button after redirect
        }, 2000);
      } else {
        setError(data.message || 'Login failed');
        setIsSubmitting(false); // Reset button on error
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false); // Reset button on exception
    }
  };

  return (
    <>
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <FormWrapper>
        <h2>Login to M-Farm</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isSubmitting} // Disable during submission
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
          <p>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </Form>
      </FormWrapper>
      <Footer />
    </>
  );
};

export default Login;