import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  initializeAuth, 
  getCurrentUser, 
  onAuthStateChanged 
} from '../services/authService';
import { getUserData } from '../services/userService';

// Create Auth Context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Firebase auth on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
        setAuthInitialized(true);
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(async (user) => {
          setIsLoading(true);
          
          if (user) {
            console.log('User authenticated:', user.uid);
            setUser(user);
            setIsAuthenticated(true);
            
            // Fetch additional user data from Firestore
            try {
              const firestoreData = await getUserData(user.uid);
              setUserData(firestoreData);
            } catch (err) {
              console.error('Error fetching user data:', err);
              // Don't stop the authentication flow if Firestore fetch fails
            }
          } else {
            console.log('No user authenticated');
            setUser(null);
            setUserData(null);
            setIsAuthenticated(false);
          }
          
          setIsLoading(false);
        });
        
        // Return cleanup function
        return () => unsubscribe();
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err.message);
        setAuthInitialized(true);
        setIsLoading(false);
        
        // In a production app, you might want to handle this differently
        // For now, we'll fall back to a non-authenticated state
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
      }
    };
    
    initAuth();
  }, []);

  // Refresh user data when user changes
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && user.uid) {
        try {
          const firestoreData = await getUserData(user.uid);
          setUserData(firestoreData);
        } catch (err) {
          console.error('Error refreshing user data:', err);
        }
      }
    };
    
    refreshUserData();
  }, [user]);

  // The value to be provided to consumers of this context
  const authValue = {
    user,
    userData,
    isAuthenticated,
    isLoading,
    authInitialized,
    error,
    refreshUserData: async () => {
      if (user && user.uid) {
        try {
          const firestoreData = await getUserData(user.uid);
          setUserData(firestoreData);
          return firestoreData;
        } catch (err) {
          console.error('Error refreshing user data:', err);
          throw err;
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
