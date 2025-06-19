// Minimal Firebase Auth test that replicates the exact error
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0",
  authDomain: "timetable-28639.firebaseapp.com",
  projectId: "timetable-28639",
  storageBucket: "timetable-28639.firebasestorage.app",
  messagingSenderId: "653769103112",
  appId: "1:653769103112:web:7b7fe45718bec053843ebd",
  measurementId: "G-J0F10129PJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  try {
    console.log('Testing Firebase Auth with exact conditions...');
    
    const email = 'jz18@yvg.vic.edu.au';
    const password = 'Test123!'; // Assuming a simple password
    
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Auth instance:', !!auth);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Success! User created:', userCredential.user.uid);
    
    // Clean up
    await userCredential.user.delete();
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Full error:', error);
  }
}

testAuth();
