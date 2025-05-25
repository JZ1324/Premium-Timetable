# Premium Timetable - Project Structure

This document outlines the organized structure of the Premium Timetable project.

## 📁 Directory Structure

### Core Application Files
```
src/                    # Main application source code
├── components/         # React components
├── services/          # Business logic and API services
├── styles/            # CSS stylesheets
├── assets/            # Static assets (themes, fonts)
├── utils/             # Utility functions
└── tests/             # Component tests

public/                # Static public files
├── index.html         # Main HTML template
├── assets/            # Public assets
└── 404.html          # Error page

build/                 # Built application (generated)
```

### Documentation
```
docs/
├── ai-parser/         # AI parser related documentation
├── deployment/        # Deployment guides and configs
├── fixes/             # Bug fixes and patches documentation
├── guides/            # Feature guides and setup instructions
└── dev-notes/         # Development notes and changelogs
```

### Scripts and Tools
```
scripts/
├── build/             # Build-related scripts
│   └── fix-html-on-build.js
├── deployment/        # Deployment scripts
│   ├── deploy-to-vercel.sh
│   ├── github-to-vercel.sh
│   └── migrate-to-new-repo.sh
├── testing/           # Testing and validation scripts
│   ├── test-*.js      # Various test files
│   └── verify-*.js    # Verification scripts
├── maintenance/       # Maintenance and cleanup scripts
│   ├── cleanup-*.sh
│   └── manual-fix-*.sh
└── configs/           # Configuration files
    ├── vercel-build.js
    └── vercel.json
```

### Backup and Archives
```
backup/
├── components/        # Backed up component files
├── configs/           # Old configuration files
└── old-files/         # Miscellaneous old files

cleanup-backup/        # Files from previous cleanup operations
parser-backups/        # AI parser backup files
aiparser-backups/      # Additional AI parser backups
```

## 🚀 Key Files

### Configuration
- `package.json` - Project dependencies and scripts
- `webpack.config.js` - Webpack build configuration
- `firebase.json` - Firebase hosting configuration

### Main Entry Points
- `src/index.js` - Application entry point
- `src/App.js` - Main App component
- `public/index.html` - HTML template

## 📝 Important Notes

### Scripts Have Been Updated
The `package.json` scripts have been updated to reference the new file locations:
- Build scripts now reference `scripts/build/`
- Test scripts now reference `scripts/testing/`
- Vercel build references `scripts/configs/`

### Website Functionality
All core website functionality remains intact. The reorganization only affects:
- Documentation files (moved to `docs/`)
- Development scripts (moved to `scripts/`)
- Backup files (moved to `backup/`)

### Running the Application
The application can still be run using the same commands:
```bash
npm start          # Development server
npm run build      # Production build
npm run deploy     # Deploy to Firebase
```

## 🔄 Maintenance

This organization makes it easier to:
- Find specific documentation quickly
- Manage development scripts
- Maintain clean separation between code and tools
- Keep track of backup files
- Onboard new developers

## 📚 Documentation Index

For specific topics, check these directories:
- **AI Parser Issues**: `docs/ai-parser/`
- **Deployment Help**: `docs/deployment/`
- **Bug Fixes**: `docs/fixes/`
- **Feature Guides**: `docs/guides/`
- **Development Notes**: `docs/dev-notes/`
