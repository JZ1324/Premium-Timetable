# Customizable Timetable App

A customizable timetable application that allows users to personalize their own timetable and select from different themes.

## Features

- **Customizable Timetable**: Create and manage your personal timetable.
- **Theme Selection**: Choose from multiple visual themes.
- **User Authentication**: Secure login with Firebase authentication.
- **Responsive Design**: Works on desktop and mobile devices.
- **Offline Support**: Basic functionality works offline.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root of the project with your Firebase configuration:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0
REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=timetable-28639
REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112
REACT_APP_FIREBASE_APP_ID=1:653769103112:web:7b7fe45718bec053843ebd
REACT_APP_FIREBASE_MEASUREMENT_ID=G-J0F10129PJ
```

4. Start the development server:

```bash
npm start
```

## Deployment Options

### Firebase Hosting

The application is configured to deploy to Firebase Hosting using the site ID `timetable-28639-f04f7`.

#### Setting up Firebase CLI

Run the setup script to install and configure the Firebase CLI:

```bash
./setup-firebase-cli.sh
```

#### Deploying to Firebase

Use the provided deployment script:

```bash
./deploy-firebase.sh
```

Or use npm:

```bash
npm run deploy
```

After deployment, your application will be available at:
- https://timetable-28639-f04f7.web.app
- https://timetable-28639-f04f7.firebaseapp.com

### GitHub Pages

You can also deploy to GitHub Pages:

```bash
npm run deploy:github
```

For detailed GitHub Pages deployment instructions, see the [GitHub Pages Deployment Guide](GITHUB_PAGES_DEPLOYMENT.md).

## Documentation

- [Firebase Configuration Update](FIREBASE_CONFIG_UPDATE.md)
- [Firebase Hosting Guide](FIREBASE_HOSTING_GUIDE.md)
- [Firebase Security](FIREBASE_SECURITY.md)
- [GitHub Pages Deployment](GITHUB_PAGES_DEPLOYMENT.md)
- [Environment Setup](ENV_SETUP.md)
- [Manual Deployment](MANUAL_DEPLOYMENT.md)

## Troubleshooting

If you encounter Firebase authentication issues:

1. Verify your `.env` configuration 
2. Run the diagnostic script:
```bash
./firebase-auth-diagnostic.sh
```
3. Test Firebase authentication independently:
```bash
./test-firebase-auth.sh
```

## License

This project is licensed under the MIT License.
