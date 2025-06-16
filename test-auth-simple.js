// Simple Firebase Auth test
console.log('Testing Firebase Auth...');

// Test the same registration that's failing
const testEmail = 'jz18@yvg.vic.edu.au';
const testPassword = 'TestPassword123!'; // Make sure this meets Firebase requirements

// Check if Firebase is loaded
if (typeof firebase !== 'undefined') {
    console.log('Firebase loaded successfully');
    
    // Test user creation
    firebase.auth().createUserWithEmailAndPassword(testEmail, testPassword)
        .then((userCredential) => {
            console.log('✅ User created successfully!', userCredential.user.uid);
            
            // Clean up - delete the test user
            return userCredential.user.delete();
        })
        .then(() => {
            console.log('✅ Test user deleted successfully');
        })
        .catch((error) => {
            console.error('❌ Error:', error.code, error.message);
            console.log('Error details:', error);
        });
} else {
    console.error('Firebase not loaded');
}
