# Premium-Timetable

A customizable timetable application that allows users to personalize their own timetable and select from different themes.

## Features

- Customizable timetable display with multiple themes
- AI-powered timetable parsing from various formats
- Automatic template saving with customizable names
- User profile management
- Cloud synchronization with Firebase
- Private study period support
- Multiple deployment options (Vercel, GitHub Pages)

## Documentation

Documentation is available in the `docs` directory, organized by topic:

- [AI Parser Documentation](docs/ai-parser/) - Information about the AI parser implementation and fixes
- [Deployment Guides](docs/deployment/) - Instructions for deploying to various platforms
- [Setup Guides](docs/setup/) - Setup instructions for admins and developers
- [Feature Documentation](docs/features/) - Details about specific features and fixes

## Recent Changes

- **Customizable Template Names**: Users can now personalize template names when importing timetables, with smart name suggestions provided automatically.
- **Automatic Template Saving**: Imported timetables are now automatically saved as templates. See [AUTO_TEMPLATE_SAVE_FEATURE.md](AUTO_TEMPLATE_SAVE_FEATURE.md) for details.
- **AI Parser Enhancement**: See the [ai-parser-fix-documentation.md](docs/ai-parser/ai-parser-fix-documentation.md) for details about the AI parser enhancement fix, which addressed the `enhanceClassData` method implementation.

## Development

To set up the application for local development:

1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with appropriate Firebase configuration (see [ENV_SETUP.md](docs/setup/ENV_SETUP.md))
4. Run `npm start` to start the development server

## Deployment

For deployment instructions, refer to:

- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- [GitHub Pages Deployment Guide](docs/deployment/GITHUB_PAGES_DEPLOYMENT.md)
