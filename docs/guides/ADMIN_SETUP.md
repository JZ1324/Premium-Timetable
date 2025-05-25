# Setting Up Admin Accounts in Firebase

This guide explains how to set up and manage admin accounts in your timetable application.

## Option 1: Using the Admin Script (Recommended)

1. **Prerequisites**
   - Make sure you have Node.js installed
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Log in to Firebase: `firebase login`

2. **Generate Service Account Key**
   - Go to your [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the downloaded JSON file as `service-account-key.json` in the project root directory

3. **Run the Admin Script**
   ```bash
   ./set_admin.sh user@example.com
   ```
   Replace `user@example.com` with the email of the user you want to make an admin.

4. **Verify Admin Status**
   - Sign in with the user account
   - The admin button should now be visible in the timetable interface

## Option 2: Manual Setup Using Firebase Console

1. **Access Firestore Database**
   - Go to your [Firebase Console](https://console.firebase.google.com/)
   - Navigate to "Firestore Database"
   - Find the "users" collection

2. **Find the User Document**
   - Locate the document corresponding to the user you want to make an admin
   - The document ID will be the user's UID (from Firebase Authentication)

3. **Add Admin Role Field**
   - Click on the user document to edit it
   - Add a new field:
     - Field name: `role`
     - Field value: `admin`
   - Click "Save"

4. **Verify Admin Status**
   - Sign in with the user account
   - The admin button should now be visible in the timetable interface

## Option 3: Using Firebase Admin SDK in Your Application

For more advanced applications, you might want to set up a secure admin management system:

1. **Create a Secure Admin Management Page**
   - Create a new component that's only accessible to existing admins
   - This page should list all users and allow toggling admin status

2. **Set Up Cloud Functions (Optional)**
   - For better security, implement admin role changes using Firebase Cloud Functions
   - This prevents client-side manipulation of admin privileges

## How Admin Status Works in the Application

The application checks for admin status using the following logic:

1. When a user logs in, the `getUserData()` function retrieves their user document from Firestore
2. The `isAdmin()` function checks if the user has the 'admin' role in their user document
3. If the user is an admin, the admin button appears in the timetable interface
4. Clicking the admin button opens the admin terminal with special commands

## Security Considerations

- Admin privileges should be granted carefully
- Consider implementing additional security measures like IP restrictions or two-factor authentication for admin accounts
- Regularly audit the list of admin users in your Firestore database
