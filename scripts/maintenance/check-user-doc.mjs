// Check if user document exists in Firestore for the existing Firebase Auth user
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function checkUserDocument() {
  try {
    const userId = 'BKG4Iqn0GUQRDY31WgMlweMupNE3'; // UID for jz18@yvg.vic.edu.au
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('✅ User document exists in Firestore:', userDoc.data());
    } else {
      console.log('❌ User document does NOT exist in Firestore');
      console.log('The user has Firebase Auth account but no Firestore document');
    }
  } catch (error) {
    console.error('Error checking user document:', error);
  }
}

checkUserDocument();
