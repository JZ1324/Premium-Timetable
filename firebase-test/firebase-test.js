// Firebase Authentication Test Environment JavaScript
// This file contains the JavaScript code for the Firebase Authentication Test Environment

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: "", // API key should be set via environment variable
  authDomain: "timetable-28639.firebaseapp.com",
  projectId: "timetable-28639",
  storageBucket: "timetable-28639.appspot.com",
  messagingSenderId: "653769103112",
  appId: "1:653769103112:web:ba7fac1278faff3d843ebd",
  measurementId: "G-3CSMHJHN2H"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// List of disposable email domains to block
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

// Check if email is from a disposable provider
function isDisposableEmail(email) {
  const domain = email.split('@')[1];
  return disposableEmailDomains.includes(domain);
}

// Check if username already exists in Firestore
async function isUsernameAvailable(username) {
  // Special handling for the "JZ" username
  // This ensures that if "JZ" is already taken, the check fails
  // If it's not yet taken, we'll perform the normal availability check
  if (username === "JZ") {
    const usersRef = db.collection('users');
    const query = usersRef.where('username', '==', username);
    const querySnapshot = await query.get();
    return querySnapshot.empty; // Returns true if JZ is available
  }
  
  const usersRef = db.collection('users');
  const query = usersRef.where('username', '==', username);
  const querySnapshot = await query.get();
  return querySnapshot.empty; // Returns true if username is available
}

// Create user document in Firestore
async function createUserDocument(uid, userData) {
  await db.collection('users').doc(uid).set({
    ...userData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Register new user with complete validation
async function registerUser(username, email, password) {
  // Check if email is from a disposable provider
  if (isDisposableEmail(email)) {
    throw new Error('Temporary emails are not allowed.');
  }
  
  // Check if username is available
  if (!(await isUsernameAvailable(username))) {
    throw new Error('Username already taken');
  }
  
  // Create user with Firebase Authentication
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  
  // Store user data in Firestore
  await createUserDocument(user.uid, {
    username,
    email,
    displayName: username // Set displayName to username by default
  });
  
  // Update profile with username as displayName
  await user.updateProfile({ displayName: username });
  
  return userCredential;
}

// Get user data from Firestore
async function getUserData(uid) {
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) {
    return userDoc.data();
  }
  return null;
}
