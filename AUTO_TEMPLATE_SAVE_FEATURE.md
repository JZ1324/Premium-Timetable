# Automatic Template Saving Feature

## Overview

This feature automatically saves imported timetables as templates. This ensures that users don't lose their imported timetable data and can easily access it again later. Users can customize the template name or use the auto-generated suggestion.

## Implementation Details

When a timetable is imported (via any import method), the system will:

1. Generate a meaningful suggested template name using:
   - Date of import
   - Subject names from the imported timetable (if available)
   
2. Prompt the user to customize the template name
   - The suggested name is pre-filled in the prompt
   - The user can modify it, accept it, or cancel
   
3. Save the current timetable data as a new template
   - The base "school" template remains unmodified
   - Only custom/saved templates are affected

4. Set the newly created template as the current active template

5. Provide feedback to the user that their timetable has been imported and saved

## Technical Implementation

The feature is implemented through:

1. A utility function `generateImportTemplateName()` that creates meaningful suggested template names based on:
   - Current date
   - Subject names extracted from the timetable (if available)

2. A utility function `saveAutoTemplate()` that handles:
   - Prompting the user for a custom template name
   - Providing the suggested name as default value
   - Saving the template with the user's chosen name
   - Updating UI state
   - Providing appropriate user notifications
   - Error handling with fallback options

3. Integration with all import paths:
   - AI-parsed timetable imports
   - Raw text imports
   - JSON structure imports
   - Legacy timeSlots format imports

## Benefits

- Prevents data loss after importing
- Makes it easy for users to revert to previous timetables
- Creates a history of imported timetables
- Generates descriptive template names for easy identification
- Allows users to personalize their template names
- Provides smart name suggestions based on timetable contents
- Works across all import methods consistently
