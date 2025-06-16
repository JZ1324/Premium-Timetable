#!/usr/bin/env node
/**
 * Test Firebase Auth registration directly
 * This will help isolate the issue with user registration
 */

// Using the HTML-loaded Firebase instead of importing
console.log('Testing Firebase Auth registration...');

// Test data
const testEmail = 'test_' + Date.now() + '@example.com';
const testPassword = 'TestPassword123';

console.log('Test email:', testEmail);
console.log('Test password:', testPassword);

// This script should be run in a browser environment, not Node.js
if (typeof window === 'undefined') {
  console.log('❌ This test needs to be run in a browser environment.');
  console.log('Please open the browser console and run the test there.');
  process.exit(1);
}

// Export the test function so it can be run in browser
window.testFirebaseRegistration = async () => {
  try {
    console.log('🔥 Starting Firebase Auth test...');
    
    if (!window.firebase) {
      throw new Error('Firebase not loaded');
    }
    
    const auth = window.firebase.auth();
    console.log('🔥 Firebase Auth initialized');
    
    // Test registration
    console.log('🔥 Creating user with email/password...');
    const userCredential = await auth.createUserWithEmailAndPassword(testEmail, testPassword);
    
    console.log('✅ User created successfully!', userCredential.user.uid);
    
    // Clean up - delete the test user
    await userCredential.user.delete();
    console.log('✅ Test user deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};

console.log('Test function exported as window.testFirebaseRegistration()');
console.log('Run this in browser console: testFirebaseRegistration()');
