/**
 * User Service
 * Handles Firestore operations for user management
 */

let db;

/**
 * Initialize Firestore
 */
export const initializeFirestore = () => {
  try {
    // Use Firebase v8 compat SDK that's loaded via HTML script tags
    if (typeof window !== 'undefined' && window.firebase) {
      db = window.firebase.firestore();
      console.log('🔥 Firestore initialized using v8 compat SDK');
      return db;
    } else {
      throw new Error('Firebase not available. Please check HTML script tags.');
    }
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
    console.log('🔍 Firebase project ID:', window.firebase?.app()?.options?.projectId);
    
    // Special handling for the "JZ" username
    if (username === "JZ") {
      const usersRef = db.collection('users');
      const querySnapshot = await usersRef.where('username', '==', username).get();
      console.log('🔍 Querying for JZ username...');
      const isAvailable = querySnapshot.empty;
      console.log('🔍 JZ username available:', isAvailable);
      return isAvailable;
    }
    
    // Use v8 compat syntax for Firestore query
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).get();
    console.log('🔍 Querying for username:', username);
    
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
    console.log('Firebase project ID:', window.firebase?.app()?.options?.projectId);
    console.log('Expected project ID: timetable-28639');
    
    const userDoc = {
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    console.log('Final document data:', userDoc);
    console.log('Document path will be: users/' + uid);
    
    // Use v8 compat syntax for Firestore
    await db.collection('users').doc(uid).set(userDoc);
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
  
  try {
    // Use v8 compat syntax for Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update user document in Firestore
 */
export const updateUserDocument = async (uid, userData) => {
  if (!db) {
    initializeFirestore();
  }
  
  try {
    const userDocRef = db.collection('users').doc(uid);
    
    // Check if document exists first
    const docSnap = await userDocRef.get();
    
    if (docSnap.exists) {
      // Update existing document
      await userDocRef.update({
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new document if it doesn't exist
      await userDocRef.set({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

/**
 * Set user as admin
 */
export const setUserAsAdmin = async (uid) => {
  if (!db) {
    initializeFirestore();
  }
  
  try {
    const userDocRef = db.collection('users').doc(uid);
    
    // Check if document exists first
    const docSnap = await userDocRef.get();
    
    if (docSnap.exists) {
      // Update user role to admin
      await userDocRef.update({
        role: 'admin',
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    throw error;
  }
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
