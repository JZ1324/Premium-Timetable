import React, { useState, useEffect } from 'react';
import { initializeAuth, registerUser } from '../services/authService';
import '../styles/components/Signup.css';

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;
    
    // Initialize Firebase when component mounts
    const init = async () => {
      try {
        await initializeAuth();
        // Only update state if component is still mounted
        if (isMounted) {
          setFirebaseInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        // Only update state if component is still mounted
        if (isMounted) {
          setError('Failed to initialize authentication service.');
        }
      }
    };

    init();

    // Cleanup function to run when component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    // Username validation - letters, numbers, and underscores only
    // Special exception for "JZ" username
    if (username === "JZ") {
      // Allow "JZ" as a special case
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
      if (!usernameRegex.test(username)) {
        setError('Username must be 3-16 characters and can only contain letters, numbers, and underscores');
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation - at least 8 characters, one letter, one number
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one letter and one number');
      return false;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Create a variable to track if the component is mounted during this async operation
    let isMounted = true;
    
    if (!validateForm()) {
      return;
    }

    if (!firebaseInitialized) {
      setError('Authentication service not ready yet. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const userCredential = await registerUser(username, email, password);
      const user = userCredential.user;
      
      console.log('Registration successful:', user.uid);
      
      // Only update state if component is still mounted
      if (isMounted) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Notify parent component or redirect after a short delay
        setTimeout(() => {
          if (isMounted) {
            if (onSignupSuccess) {
              onSignupSuccess(user);
            } else if (onSwitchToLogin) {
              onSwitchToLogin();
            }
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Only update state if component is still mounted
      if (isMounted) {
        if (error.code === 'auth/email-already-in-use') {
          setError('This email is already in use');
        } else if (error.message === 'Username already taken') {
          setError('This username is already taken');
        } else if (error.message === 'Temporary emails are not allowed.') {
          setError('Disposable email providers are not allowed');
        } else {
          setError(error.message || 'Registration failed. Please try again.');
        }
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="signup-form">
      <h2>Create a new account</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Choose a username"
          />
          <p className="input-hint">3-16 characters, letters, numbers, and underscores only</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Create a password"
          />
          <p className="input-hint">At least 8 characters with letters and numbers</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Confirm your password"
          />
        </div>
        
        <button 
          type="submit" 
          className="signup-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="switch-form">
          <p>Already have an account? <button 
            type="button" 
            className="switch-button" 
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Sign In
          </button></p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
