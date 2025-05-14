/**
 * Firebase Authentication Service
 * Provides methods for user authentication and management
 */

// Fallback Firebase config for development
const devFirebaseConfig = {
  apiKey: "AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0",
  authDomain: "timetable-28639.firebaseapp.com",
  projectId: "timetable-28639",
  storageBucket: "timetable-28639.firebasestorage.app",
  messagingSenderId: "653769103112",
  appId: "1:653769103112:web:ba7fac1278faff3d843ebd",
  measurementId: "G-3CSMHJHN2H"
};

// Use environment variables if available, otherwise use the fallback config
const firebaseConfig = {
  apiKey: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_API_KEY) || devFirebaseConfig.apiKey,
  authDomain: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_AUTH_DOMAIN) || devFirebaseConfig.authDomain,
  projectId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_PROJECT_ID) || devFirebaseConfig.projectId,
  storageBucket: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_STORAGE_BUCKET) || devFirebaseConfig.storageBucket,
  messagingSenderId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID) || devFirebaseConfig.messagingSenderId,
  appId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_APP_ID) || devFirebaseConfig.appId,
  measurementId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_MEASUREMENT_ID) || devFirebaseConfig.measurementId
};

/**
 * Get Firebase configuration for use in other services
 */
export const getFirebaseConfig = () => {
  return { ...firebaseConfig };
};

let app;
let auth;
let initialized = false;

/**
 * Initialize Firebase Authentication
 */
export const initializeAuth = async () => {
  if (initialized) return auth;
  
  try {
    // Check if Firebase is already available globally (from HTML script tags)
    if (typeof window !== 'undefined' && window.firebase) {
      console.log('Using Firebase SDK from HTML script tags');
      app = window.firebase.app();
      auth = window.firebase.auth();
      initialized = true;
      return auth;
    }
    
    // If not available globally, dynamically import Firebase modules
    const { initializeApp } = await import('firebase/app');
    const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth');
    
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Set persistence to LOCAL for better user experience
    // This keeps the user logged in even after browser restarts
    await setPersistence(auth, browserLocalPersistence);
    
    initialized = true;
    
    return auth;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Sign in user with email and password
 */
export const signIn = async (email, password) => {
  if (!initialized) {
    await initializeAuth();
  }
  
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Create a new user with email and password
 */
export const createUser = async (email, password) => {
  if (!initialized) {
    await initializeAuth();
  }
  
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Register new user with username, email, and password
 * Includes validation and Firestore integration
 */
export const registerUser = async (username, email, password) => {
  if (!initialized) {
    await initializeAuth();
  }
  
  // Import necessary services
  const { isDisposableEmail, isUsernameAvailable, createUserDocument } = await import('./userService');
  
  // Check if email is from a disposable provider
  if (isDisposableEmail(email)) {
    throw new Error('Temporary emails are not allowed.');
  }
  
  // Check if username is available
  if (!(await isUsernameAvailable(username))) {
    throw new Error('Username already taken');
  }
  
  // Create user with Firebase Authentication
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store user data in Firestore
  await createUserDocument(user.uid, {
    username,
    email
  });
  
  return userCredential;
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email) => {
  if (!initialized) {
    await initializeAuth();
  }
  
  const { sendPasswordResetEmail } = await import('firebase/auth');
  return sendPasswordResetEmail(auth, email);
};

/**
 * Send email verification
 */
export const sendEmailVerification = async () => {
  if (!initialized || !auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  const { sendEmailVerification: firebaseSendEmailVerification } = await import('firebase/auth');
  return firebaseSendEmailVerification(auth.currentUser);
};

/**
 * Check if email is verified
 */
export const isEmailVerified = () => {
  if (!initialized || !auth.currentUser) return false;
  return auth.currentUser.emailVerified;
};

/**
 * Check if provided credentials are for admin user
 */
export const isAdminCredentials = (email) => {
  // Special admin access via "Monkeopolis" credential
  return email === 'Monkeopolis';
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  if (!initialized) {
    throw new Error('Firebase auth not initialized');
  }
  
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  return firebaseSignOut(auth);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  if (!initialized || !auth) return null;
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback) => {
  if (!initialized || !auth) return () => {};
  
  const importAndListen = async () => {
    const { onAuthStateChanged: firebaseAuthStateChanged } = await import('firebase/auth');
    return firebaseAuthStateChanged(auth, callback);
  };
  
  return importAndListen();
};

/**
 * Update user profile (displayName, photoURL)
 */
export const updateProfile = async (profileData) => {
  if (!initialized || !auth || !auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth');
  return firebaseUpdateProfile(auth.currentUser, profileData);
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (!initialized || !auth || !auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
  
  // Create credential with current password
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    currentPassword
  );
  
  // Reauthenticate
  await reauthenticateWithCredential(auth.currentUser, credential);
  
  // Update password
  return updatePassword(auth.currentUser, newPassword);
};

export default {
  initializeAuth,
  signIn,
  signOut,
  createUser,
  registerUser,
  resetPassword,
  getCurrentUser,
  onAuthStateChanged,
  updateProfile,
  changePassword,
  sendEmailVerification,
  isEmailVerified,
  isAdminCredentials
};
