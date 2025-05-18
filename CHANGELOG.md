# Changelog

All notable changes to the Premium-Timetable project are documented in this file.

## [1.2.1] - 2025-05-18

### Added
- Customizable template names with prompt for user input
- Smart name suggestions based on imported timetable contents
- Fallback naming mechanism if user cancels prompt

## [1.2.0] - 2025-05-18

### Added
- Automatic template saving after importing timetables
- Generated template names include subject names for better identification
- Comprehensive error handling for template saving operations
- Documentation for the auto-save template feature

## [1.1.0] - 2025-05-17

### Fixed
- Implemented missing `enhanceClassData` method in `aiParserService.js` to fix "TypeError: this.enhanceClassData is not a function"
- Day name standardization now properly maps weekday names to standard "Day X" format
- Fixed PST (Private Study) subjects to display as "Private Study"
- Period time information is now properly filled in when missing

### Added
- Enhanced test scripts to verify AI parser functionality
- Documentation for AI parser fixes and implementation details

### Changed
- Cleaned up project structure by organizing documentation into subdirectories
- Removed redundant test and backup files 

## [1.0.9] - 2025-04-30

### Fixed
- Fixed `ReferenceError: process is not defined` error in apiKeyManager.js by removing process.env references
- Added safety checks for window.location.origin in API headers
- Fixed CORS handling in API requests

### Added
- Added support for multiline tab-delimited timetable formats
- Improved tab-delimited parser with DeepSeek integration

## [1.0.8] - 2025-03-15

### Added
- Support for multiple classes per period
- Improved user profile management
- Private Study period display customization

### Changed
- Migrated to OpenRouter API for AI parsing capabilities
- Enhanced AI parser with more robust error handling
