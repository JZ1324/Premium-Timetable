// Quick script to make yourself admin
import { setUserAsAdmin } from './src/services/userService.js';

const makeAdmin = async () => {
  const yourUserId = 'm2nTJkGmZPWvOjZViTyRigLySIB3';
  
  try {
    const result = await setUserAsAdmin(yourUserId);
    if (result) {
      console.log('Successfully set as admin!');
    } else {
      console.log('Failed to set admin - user document not found');
    }
  } catch (error) {
    console.error('Error setting admin:', error);
  }
};

makeAdmin();
