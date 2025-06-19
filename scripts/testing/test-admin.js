// Test Firebase connection and admin status
// Run this in your browser console

const testFirebaseAdmin = async () => {
  const uid = 'm2nTJkGmZPWvOjZViTyRigLySIB3';
  
  console.log('=== FIREBASE ADMIN TEST ===');
  console.log('Testing UID:', uid);
  
  try {
    // Test if we can import the functions
    const { getUserData, isAdmin } = await import('./src/services/userService.js');
    
    console.log('1. Testing getUserData...');
    const userData = await getUserData(uid);
    console.log('   Result:', userData);
    
    console.log('2. Testing isAdmin...');
    const adminStatus = await isAdmin(uid);
    console.log('   Result:', adminStatus);
    
    console.log('3. Manual check...');
    if (userData) {
      console.log('   userData.isAdmin:', userData.isAdmin);
      console.log('   userData.role:', userData.role);
      console.log('   Manual admin check:', userData.isAdmin === true || userData.role === 'admin');
    } else {
      console.log('   No user data found!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testFirebaseAdmin();
