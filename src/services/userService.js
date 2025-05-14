/**
 * User Service
 * Handles Firestore operations for user management
 */
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getApp, initializeApp } from 'firebase/app';

// Import the Firebase configuration from authService
import { getFirebaseConfig } from './authService';

let db;

/**
 * Initialize Firestore
 */
export const initializeFirestore = () => {
  try {
    let app;
    try {
      // Try to get existing app
      app = getApp();
    } catch (error) {
      // If no app exists, initialize a new one
      const firebaseConfig = getFirebaseConfig();
      app = initializeApp(firebaseConfig);
    }
    
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

/**
 * List of disposable email domains to block
 */
const disposableEmailDomains = [
  'mailinator.com', 
  'tempmail.com', 
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'yopmail.com',
  'throwawaymail.com',
  'getairmail.com',
  'mailnesia.com',
  'maildrop.cc'
];

/**
 * Check if email is from a disposable provider
 */
export const isDisposableEmail = (email) => {
  const domain = email.split('@')[1];
  return disposableEmailDomains.includes(domain);
};

/**
 * Check if username already exists in Firestore
 */
export const isUsernameAvailable = async (username) => {
  if (!db) {
    initializeFirestore();
  }
  
  // Special handling for the "JZ" username
  // This ensures that if "JZ" is already taken, the check fails
  // If it's not yet taken, we'll perform the normal availability check
  if (username === "JZ") {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Returns true if JZ is available
  }
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // Returns true if username is available
};

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, userData) => {
  if (!db) {
    initializeFirestore();
  }
  
  await setDoc(doc(db, 'users', uid), {
    ...userData,
    createdAt: new Date().toISOString()
  });
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
  if (!db) {
    initializeFirestore();
  }
  
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

/**
 * Update user document in Firestore
 */
export const updateUserDocument = async (uid, userData) => {
  if (!db) {
    initializeFirestore();
  }
  
  const userDocRef = doc(db, 'users', uid);
  
  // Check if document exists first
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    // Update existing document
    await updateDoc(userDocRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  } else {
    // Create new document if it doesn't exist
    await setDoc(userDocRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * Set user as admin
 */
export const setUserAsAdmin = async (uid) => {
  if (!db) {
    initializeFirestore();
  }
  
  const userDocRef = doc(db, 'users', uid);
  
  // Check if document exists first
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    // Update user role to admin
    await updateDoc(userDocRef, {
      role: 'admin',
      updatedAt: new Date().toISOString()
    });
    return true;
  }
  return false;
};

/**
 * Check if a user has admin privileges
 */
export const isAdmin = async (uid) => {
  if (!uid) return false;
  
  try {
    const userData = await getUserData(uid);
    // Check if user has admin role or email is the special admin credential
    return userData && (userData.role === 'admin' || (userData.email && userData.email === 'admin@timetable.com'));
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export default {
  initializeFirestore,
  isDisposableEmail,
  isUsernameAvailable,
  createUserDocument,
  getUserData,
  updateUserDocument,
  setUserAsAdmin,
  isAdmin
};
