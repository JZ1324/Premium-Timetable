import React, { useState } from 'react';
import { signOut } from '../services/authService';
import LogoutConfirm from './LogoutConfirm';
import '../styles/components/LogoutButton.css';

const LogoutButton = ({ onLogoutSuccess, className = '' }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signOut();
      
      // Call the onLogoutSuccess callback if provided
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to sign out. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`logout-button ${className}`} 
        onClick={handleLogoutClick}
        disabled={isLoading}
      >
        <span className="user-menu-icon">🚪</span>
        <span>Logout</span>
      </button>

      {showConfirmation && (
        <LogoutConfirm
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
};

export default LogoutButton;
