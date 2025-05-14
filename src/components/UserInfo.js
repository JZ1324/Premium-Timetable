import React, { useState } from 'react';
import { sendEmailVerification } from '../services/authService';
import { useAuth } from './AuthProvider';
import '../styles/components/UserInfo.css';

const UserInfo = ({ onClose }) => {
  const { user, userData, refreshUserData } = useAuth();
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const handleSendVerification = async () => {
    if (!user || user.emailVerified) return;
    
    setIsVerifyingEmail(true);
    setVerificationSent(false);
    setVerificationError(null);
    
    try {
      await sendEmailVerification();
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending verification email:', error);
      setVerificationError(error.message || 'Failed to send verification email');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Format dates for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="user-info-modal">
        <div className="user-info-container">
          <h2>Account Information</h2>
          <p>No user logged in</p>
          <div className="info-actions">
            <button onClick={onClose} className="close-button">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-modal">
      <div className="user-info-container">
        <h2>Account Information</h2>
        
        <div className="user-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="User avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="user-details">
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
          {userData && userData.username && (
            <p><strong>Username:</strong> {userData.username}</p>
          )}
          <p>
            <strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}
            {!user.emailVerified && (
              <button 
                className="verify-button" 
                onClick={handleSendVerification}
                disabled={isVerifyingEmail || verificationSent}
              >
                {isVerifyingEmail ? 'Sending...' : verificationSent ? 'Sent!' : 'Verify Email'}
              </button>
            )}
          </p>
          {verificationError && <p className="verification-error">{verificationError}</p>}
          {verificationSent && (
            <p className="verification-sent">
              Verification email has been sent to {user.email}. Please check your inbox.
            </p>
          )}
          <p><strong>Provider:</strong> {user.providerData[0]?.providerId || 'Unknown'}</p>
          <p><strong>Created:</strong> {formatDate(user.metadata?.creationTime)}</p>
          <p><strong>Last Sign-in:</strong> {formatDate(user.metadata?.lastSignInTime)}</p>
        </div>
        
        <div className="info-actions">
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
