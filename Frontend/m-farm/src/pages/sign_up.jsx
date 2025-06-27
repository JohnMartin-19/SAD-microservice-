import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  gap: 1.5rem;
  background: #fff;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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

const SocialButton = styled(Button)`
  background-color: ${(props) => props.providerColor || '#007bff'}; /* Default blue */
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    margin-right: 0.5rem;
    height: 1.2em; /* Adjust as needed */
  }

  &:hover {
    background-color: ${(props) => props.providerHoverColor || '#0056b3'};
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #888;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #eee;
  }

  &:not(:empty)::before {
    margin-right: 0.5rem;
  }

  &:not(:empty)::after {
    margin-left: 0.5rem;
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

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8001/accounts/api/v1/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      console.log('Signup response:', data);
      if (response.ok) {
        localStorage.setItem('token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        console.log('Stored tokens:', data.tokens);
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.error('Signup error:', data);
        setError(
          data.error ||
            Object.values(data).join(', ') ||
            'Signup failed'
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Signup catch:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ---  social login
  const handleSocialLogin = (provider) => {
   
    const socialAuthUrl = `http://localhost:8001/auth/${provider}/login/`;
    window.location.href = socialAuthUrl; 
  };


  useEffect(() => {
   
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      toast.success('Logged in successfully with social account!');
      navigate('/dashboard'); 
    }
   
    const socialError = params.get('error');
    if (socialError) {
      setError(`Social login failed: ${socialError}`);
    }

    
    if (accessToken || refreshToken || socialError) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

  }, [navigate]); // Only re-run if navigate function changes


  return (
    <>
    <br />
    <br />

      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <ToastContainer position="top-right" autoClose={3000} />
      <FormWrapper>
        <h2>Sign Up for M-Farm</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
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
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </Button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          {/* --- New: Social Login Buttons --- */}
          <OrDivider>Or</OrDivider>
          <SocialButton
            type="button"
            onClick={() => handleSocialLogin('google')}
            providerColor="#DB4437" /* Google Red */
            providerHoverColor="#C1352A"
          >
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" />
            Sign up with Google
          </SocialButton>
          <SocialButton
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            providerColor="#4267B2" /* Facebook Blue */
            providerHoverColor="#365899"
          >
            <img src="https://img.icons8.com/color/16/000000/facebook-new.png" alt="Facebook" />
            Sign up with Facebook
          </SocialButton>
          <SocialButton
            type="button"
            onClick={() => handleSocialLogin('github')}
            providerColor="#333" /* GitHub Dark */
            providerHoverColor="#000"
          >
            <img src="https://img.icons8.com/ios-filled/16/ffffff/github.png" alt="GitHub" />
            Sign up with GitHub
          </SocialButton>
          {/* Add more social providers as needed */}
        </Form>
      </FormWrapper>
    </>
  );
};

export default Signup;