/**
 * User Service
 * Handles Firestore operations for user management
 */
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getApp, initializeApp } from 'firebase/app';

// Import Firebase config directly
import firebaseConfig from '../firebase-config';

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
  
  try {
    console.log('🔍 Checking username availability for:', username);
    console.log('🔍 Firebase project ID:', db?.app?.options?.projectId);
    
    // Special handling for the "JZ" username
    if (username === "JZ") {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      console.log('🔍 Querying for JZ username...');
      const querySnapshot = await getDocs(q);
      const isAvailable = querySnapshot.empty;
      console.log('🔍 JZ username available:', isAvailable);
      return isAvailable;
    }
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    console.log('🔍 Querying for username:', username);
    const querySnapshot = await getDocs(q);
    const isAvailable = querySnapshot.empty;
    console.log('🔍 Username available:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('❌ Error checking username availability:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    // If we can't check username availability due to permissions,
    // we'll assume it's available and let the registration proceed
    // The worst case is a duplicate username error later
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Permission denied for username check, proceeding anyway');
      return true; // Assume available
    }
    
    throw error;
  }
};

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, userData) => {
  if (!db) {
    initializeFirestore();
  }
  
  try {
    console.log('Creating user document for UID:', uid);
    console.log('User data:', userData);
    console.log('Firestore instance:', db);
    console.log('Firebase project ID:', db?.app?.options?.projectId);
    console.log('Expected project ID: timetable-28639');
    
    const userDoc = {
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    console.log('Final document data:', userDoc);
    console.log('Document path will be: users/' + uid);
    
    await setDoc(doc(db, 'users', uid), userDoc);
    console.log('User document created successfully');
  } catch (error) {
    console.error('Error creating user document:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
  if (!db) {
    initializeFirestore();
  }
  
  // Ensure authentication state is loaded (this was the fix!)
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  
  // Small delay to ensure auth is ready
  if (!auth.currentUser) {
    await new Promise(resolve => setTimeout(resolve, 100));
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
    
    // Check if user has admin role or isAdmin field set in Firebase
    return userData && (
      userData.role === 'admin' || 
      userData.isAdmin === true
    );
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
