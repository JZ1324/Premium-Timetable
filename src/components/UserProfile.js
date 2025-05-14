import React, { useState, useEffect } from 'react';
import { updateProfile, getCurrentUser } from '../services/authService';
import { getUserData, updateUserDocument } from '../services/userService';
import '../styles/components/UserProfile.css';

const UserProfile = ({ onClose }) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [firestoreData, setFirestoreData] = useState(null);
  const [usernameReadOnly, setUsernameReadOnly] = useState(true);

  // Load current user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        
        // Fetch additional data from Firestore
        try {
          const userData = await getUserData(currentUser.uid);
          setFirestoreData(userData);
          if (userData && userData.username) {
            setUsername(userData.username);
            // Username can only be set once and not changed later
            setUsernameReadOnly(true);
          } else {
            setUsernameReadOnly(false);
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
        }
      }
    };

    loadUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Update profile in Firebase Authentication
      await updateProfile({
        displayName
      });

      // Update user document in Firestore if it exists
      if (user) {
        const updateData = { displayName };
        
        // Only update username if it's allowed to be changed and not empty
        if (!usernameReadOnly && username.trim()) {
          updateData.username = username.trim();
        }
        
        await updateUserDocument(user.uid, updateData);
      }

      // Update local user object
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      
      // If username was set for the first time, make it read-only now
      if (!usernameReadOnly && username.trim()) {
        setUsernameReadOnly(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="modal-overlay">
        <div className="user-profile-modal">
          <div className="modal-header">
            <h2>User Profile</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="user-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="user-avatar-section">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="User avatar" 
                className="profile-avatar" 
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {displayName ? displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
            )}
          </div>
          
          {error && <div className="profile-error">{error}</div>}
          {successMessage && <div className="profile-success">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={user.email || ''}
                disabled
                className="disabled-input"
              />
              <p className="input-hint">Email cannot be changed</p>
            </div>
            
            {/* Add username field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || usernameReadOnly}
                className={usernameReadOnly ? "disabled-input" : ""}
                placeholder="Enter a username"
              />
              {usernameReadOnly && (
                <p className="input-hint">Username cannot be changed once set</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your display name"
              />
            </div>
            
            <div className="profile-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
