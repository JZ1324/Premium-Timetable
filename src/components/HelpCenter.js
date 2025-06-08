import React, { useState } from 'react';
import '../styles/components/HelpCenter.css';

const HelpCenter = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: 'ri-rocket-line' },
    { id: 'timetable', title: 'Timetable Management', icon: 'ri-calendar-line' },
    { id: 'planner', title: 'Academic Planner', icon: 'ri-book-open-line' },
    { id: 'productivity', title: 'Productivity Features', icon: 'ri-flashlight-line' },
    { id: 'advanced', title: 'Advanced Features', icon: 'ri-tools-line' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: 'ri-question-line' },
    { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: 'ri-keyboard-line' },
    { id: 'data', title: 'Data & Sync', icon: 'ri-cloud-line' }
  ];

  const helpContent = {
    'getting-started': {
      title: 'Getting Started with Academic Planner',
      items: [
        {
          question: 'Welcome to Your Academic Command Center',
          answer: `This application combines a powerful timetable manager with a comprehensive academic planner. You can manage your class schedule, track assignments, set study goals, and optimize your academic performance all in one place.

**Quick Start Guide:**
1. **Set up your timetable** by clicking empty time slots or using the Import feature
2. **Switch to Academic Planner** to add tasks and assignments
3. **Customize your experience** with themes and settings
4. **Start using productivity features** like timers and Focus Mode`,
          type: 'intro'
        },
        {
          question: 'How do I navigate between different sections?',
          answer: `Use the main navigation tabs at the top:
• **Timetable** - Manage your class schedule
• **Academic Planner** - Track tasks, assignments, and study sessions
• **Settings** - Customize themes and preferences
• **Help** - Access this comprehensive help center

You can also use keyboard shortcuts (1-4) to quickly switch between planner views.`
        },
        {
          question: 'Setting up your first timetable',
          answer: `**Method 1: Manual Entry**
1. Click on any empty time slot in the timetable grid
2. Fill in subject name, room, teacher, and other details
3. Save and repeat for all your classes

**Method 2: Import Feature**
1. Click the "Import" button
2. Paste your timetable data from any source
3. Use our AI parser for automatic formatting

**Method 3: Templates**
Choose from pre-made templates and customize them to match your schedule.`
        },
        {
          question: 'Customizing your workspace',
          answer: `Access the settings panel (⚙️) to personalize your experience:
• **Themes** - Choose from light, dark, and colorful themes
• **Display Options** - Adjust time formats, week start day
• **Notifications** - Configure reminder settings
• **Account Settings** - Manage profile and sync preferences

Your preferences are automatically saved and synced across devices.`
        }
      ]
    },
    'timetable': {
      title: 'Timetable Management',
      items: [
        {
          question: 'Creating and editing classes',
          answer: `**Adding Classes:**
• Click any empty time slot to add a new class
• Fill in required fields: Subject, Room, Teacher
• Optional fields: Code, Notes, Color coding

**Editing Classes:**
• Click on existing classes to modify details
• Drag and drop to move classes to different time slots
• Right-click for quick actions (edit, delete, duplicate)

**Bulk Operations:**
• Select multiple classes for batch editing
• Copy entire days or weeks
• Apply changes to recurring classes`
        },
        {
          question: 'AI Timetable Parser',
          answer: `Our AI parser can automatically convert messy timetable data:

**Supported Formats:**
• PDF exports from student portals
• Email timetable notifications
• Spreadsheet data
• Text-based schedules

**How to Use:**
1. Copy your timetable data from any source
2. Go to Import → AI Parser tab
3. Paste your data and click "Parse with AI"
4. Review and confirm the parsed results
5. Import directly to your timetable

The AI handles various formats and can identify subjects, times, rooms, and teachers automatically.`
        },
        {
          question: 'Managing multiple timetables',
          answer: `**Template System:**
• Save your current timetable as a template
• Create different templates for different semesters
• Share templates with classmates
• Import community templates

**Switching Between Schedules:**
• Use the template dropdown to switch schedules
• Maintain separate timetables for different terms
• Archive old schedules for reference

**Backup and Restore:**
• Export timetables as JSON files
• Set up automatic cloud backups
• Restore from backup files when needed`
        }
      ]
    },
    'planner': {
      title: 'Academic Planner Features',
      items: [
        {
          question: 'Task and Assignment Management',
          answer: `**Creating Tasks:**
• Click "New Task" to add individual tasks
• Set priority levels (High, Medium, Low)
• Add due dates and estimated time
• Assign to specific subjects

**Creating Assignments:**
• Click "New Assignment" for complex projects
• Break down into subtasks automatically
• Set milestones and deadlines
• Track progress with completion percentages

**Organization Features:**
• Color coding by subject or priority
• Automatic grouping (overdue, today, upcoming)
• Custom tags and labels
• Smart sorting algorithms`
        },
        {
          question: 'Study Timer and Focus Mode',
          answer: `**Study Timer:**
• Click the timer button (⏱️) on any task
• Automatic progress tracking as you study
• Session history and analytics
• Pomodoro technique integration

**Focus Mode:**
• Click the focus icon to enter distraction-free mode
• Clean interface with just your current task
• Built-in study tips and motivation
• Ambient background options
• Break reminders and suggestions

**Timer Features:**
• Real-time progress updates
• Session pause and resume
• Automatic time logging
• Integration with task completion tracking`
        },
        {
          question: 'AI Study Suggestions',
          answer: `Our AI analyzes your study patterns to provide personalized recommendations:

**Types of Suggestions:**
• When to take breaks based on study time
• Which subjects to focus on next
• Optimal study session length
• Task prioritization recommendations
• Subject variety suggestions

**How It Works:**
• Monitors your study sessions and patterns
• Analyzes task completion rates
• Considers upcoming deadlines
• Factors in your productivity peaks
• Adapts to your preferences over time

**Acting on Suggestions:**
• Click suggestion cards to apply them
• Customize which types of suggestions you see
• Rate suggestions to improve accuracy`
        },
        {
          question: 'Views and Organization',
          answer: `**Day View:**
• Today's tasks with priority grouping
• AI suggestions for optimal studying
• Quick task creation and editing
• Real-time progress tracking

**Week View:**
• 7-day calendar layout
• Task distribution across the week
• Drag and drop task scheduling
• Workload balancing visualization

**Month View:**
• Monthly overview for long-term planning
• Major deadline visibility
• Project milestone tracking
• Academic calendar integration

**Year View:**
• Annual academic planning
• Semester and term organization
• Major project timelines
• Achievement tracking and goals`
        }
      ]
    },
    'productivity': {
      title: 'Productivity Features',
      items: [
        {
          question: 'Task Templates and Automation',
          answer: `**Pre-built Templates:**
• Essay Writing (research, outline, draft, edit)
• Math Problem Set (review, practice, check)
• Study Session (warm-up, focus, review)
• Project Planning (brainstorm, plan, execute, present)

**Custom Templates:**
• Create your own task templates
• Set default time estimates
• Include common subtasks
• Share with study groups

**Automation Features:**
• Recurring task creation
• Auto-assignment to subjects
• Smart time estimation based on history
• Progress prediction algorithms`
        },
        {
          question: 'Analytics and Progress Tracking',
          answer: `**Analytics Dashboard:**
• Time spent per subject analysis
• Productivity trend charts
• Completion rate statistics
• Study session effectiveness metrics

**Progress Visualization:**
• Color-coded progress bars
• Completion percentage tracking
• Visual milestone markers
• Achievement badges and rewards

**Performance Insights:**
• Peak productivity hours identification
• Subject performance comparison
• Goal achievement tracking
• Improvement recommendations`
        },
        {
          question: 'Collaboration and Sharing',
          answer: `**Task Sharing:**
• Share individual tasks via link or text
• Copy task details to clipboard
• Integration with messaging apps
• Group project coordination

**Study Group Features:**
• Shared assignment tracking
• Collaborative task lists
• Group study session scheduling
• Progress sharing and motivation

**Social Features:**
• Study buddy connections
• Achievement sharing
• Leaderboards and challenges
• Peer motivation system`
        }
      ]
    },
    'advanced': {
      title: 'Advanced Features',
      items: [
        {
          question: 'Keyboard Shortcuts and Quick Actions',
          answer: `**Global Shortcuts:**
• **N** - Create new task
• **A** - Create new assignment  
• **Escape** - Close modals/exit modes
• **Ctrl/Cmd + S** - Save current work
• **Ctrl/Cmd + F** - Search tasks

**View Navigation:**
• **1** - Switch to Day View
• **2** - Switch to Week View
• **3** - Switch to Month View
• **4** - Switch to Year View

**Task Management:**
• **Space** - Start/stop timer on selected task
• **Enter** - Edit selected task
• **Delete** - Delete selected task
• **Ctrl/Cmd + D** - Duplicate task`
        },
        {
          question: 'API Integration and Extensions',
          answer: `**Calendar Integration:**
• Google Calendar sync
• Outlook integration
• iCal import/export
• Automatic event creation

**Third-party Integrations:**
• Learning Management Systems (LMS)
• Note-taking apps (Notion, Obsidian)
• Cloud storage (Google Drive, Dropbox)
• Communication tools (Slack, Discord)

**Browser Extensions:**
• Quick task capture from any webpage
• Timer overlay for focused browsing
• Deadline reminders and notifications
• Cross-platform synchronization`
        },
        {
          question: 'Customization and Themes',
          answer: `**Theme Options:**
• Light theme for daytime use
• Dark theme for low-light environments
• High contrast mode for accessibility
• Custom color schemes
• Seasonal themes and variations

**Layout Customization:**
• Sidebar position (left/right/hidden)
• Density options (compact/comfortable/spacious)
• Widget arrangement and sizing
• Custom dashboard layouts

**Advanced Settings:**
• Auto-save intervals
• Notification timing
• Backup frequency
• Performance optimization options`
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting Common Issues',
      items: [
        {
          question: 'Data Loss and Recovery',
          answer: `**My data disappeared - what happened?**
Data is stored in your browser's local storage. Common causes:
• Browser data was cleared manually
• Using incognito/private browsing mode
• Different browser or device
• Browser updates that reset storage

**Recovery Options:**
• Check if you're logged into the correct account
• Look for recent backups in Settings → Data
• Restore from exported backup files
• Contact support with your account details

**Prevention:**
• Create an account for cloud sync
• Export backups regularly
• Use the same browser consistently
• Enable automatic cloud backup`
        },
        {
          question: 'Timer and Performance Issues',
          answer: `**Timer not working properly:**
• Ensure browser allows background processes
• Keep the planner tab active during study sessions
• Check if browser is set to suspend tabs
• Disable aggressive power saving modes

**Slow performance with many tasks:**
• Archive completed tasks regularly
• Use filters to show only relevant tasks
• Clear browser cache and cookies
• Update to the latest browser version
• Check available device memory

**Sync issues:**
• Check internet connection
• Verify account login status
• Force sync in Settings
• Clear cache and reload`
        },
        {
          question: 'Import and Export Problems',
          answer: `**Import not working:**
• Check file format (JSON, CSV, or plain text)
• Ensure data follows expected structure
• Try the AI parser for complex formats
• Verify file isn't corrupted or empty

**AI parser issues:**
• Ensure text contains clear time patterns
• Include subject names and schedule structure
• Try breaking large imports into smaller chunks
• Check that the format includes day/period information

**Export problems:**
• Check browser download settings
• Ensure sufficient storage space
• Try different export formats
• Clear browser cache if exports fail`
        },
        {
          question: 'Notification and Reminder Issues',
          answer: `**Not receiving notifications:**
• Check browser notification permissions
• Verify notification settings in the app
• Ensure device notifications are enabled
• Check if "Do Not Disturb" mode is active

**Reminder timing issues:**
• Verify your timezone settings
• Check system clock accuracy
• Review reminder advance time settings
• Ensure background sync is enabled

**Mobile notification problems:**
• Add app to home screen for better integration
• Check mobile browser notification settings
• Consider using the app's built-in reminder system
• Verify push notification permissions`
        }
      ]
    },
    'shortcuts': {
      title: 'Keyboard Shortcuts Reference',
      items: [
        {
          question: 'Complete Keyboard Shortcuts Guide',
          answer: `**Navigation Shortcuts:**
• **1, 2, 3, 4** - Switch between Day, Week, Month, Year views
• **Tab** - Move between interface elements
• **Shift + Tab** - Move backwards between elements
• **Arrow Keys** - Navigate through tasks and calendar
• **Home/End** - Jump to beginning/end of lists

**Task Management:**
• **N** - Create new task
• **A** - Create new assignment
• **E** - Edit selected task
• **D** - Delete selected task
• **Space** - Start/stop timer on selected task
• **Enter** - Open task details
• **Ctrl/Cmd + D** - Duplicate selected task

**General Application:**
• **Ctrl/Cmd + S** - Save current work
• **Ctrl/Cmd + F** - Open search
• **Ctrl/Cmd + Z** - Undo last action
• **Ctrl/Cmd + Y** - Redo last undone action
• **Escape** - Close modals, exit modes, clear selections
• **F11** - Toggle fullscreen mode

**Advanced Shortcuts:**
• **Ctrl/Cmd + Shift + N** - New task with template
• **Ctrl/Cmd + Shift + A** - New assignment with subtasks
• **Ctrl/Cmd + Shift + F** - Advanced search
• **Ctrl/Cmd + Shift + E** - Export data
• **Ctrl/Cmd + Shift + I** - Import data`,
          type: 'reference'
        }
      ]
    },
    'data': {
      title: 'Data Management & Synchronization',
      items: [
        {
          question: 'Data Storage and Privacy',
          answer: `**Local Storage:**
• All data stored securely in your browser
• No data transmitted without explicit consent
• Encrypted storage for sensitive information
• Automatic cleanup of temporary data

**Cloud Synchronization:**
• Optional account-based cloud sync
• End-to-end encryption for cloud data
• Multiple device synchronization
• Selective sync options

**Privacy Commitment:**
• No tracking of personal study habits
• No data sharing with third parties
• GDPR and privacy law compliance
• User control over all data`
        },
        {
          question: 'Backup and Export Options',
          answer: `**Automatic Backups:**
• Daily automatic local backups
• Weekly cloud backups (with account)
• Backup before major updates
• Retention of multiple backup versions

**Manual Export Options:**
• JSON format for complete data
• CSV format for spreadsheet import
• PDF reports for printing
• Calendar format for external apps

**Import Capabilities:**
• Restore from backup files
• Import from other planning apps
• Bulk import via CSV
• AI-powered format conversion`
        },
        {
          question: 'Multi-device Synchronization',
          answer: `**Sync Setup:**
• Create account for cloud sync
• Verify email address
• Enable sync in settings
• Choose sync frequency

**What Gets Synced:**
• All tasks and assignments
• Timetable data
• User preferences and themes
• Templates and custom settings
• Study session history

**Conflict Resolution:**
• Most recent changes take priority
• Manual conflict resolution options
• Backup creation before sync
• Rollback capabilities if needed`
        }
      ]
    }
  };

  const filteredContent = searchQuery 
    ? Object.entries(helpContent).reduce((acc, [key, section]) => {
        const filteredItems = section.items.filter(item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredItems.length > 0) {
          acc[key] = { ...section, items: filteredItems };
        }
        return acc;
      }, {})
    : helpContent;

  const formatAnswer = (answer) => {
    return answer.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h5 key={index} className="help-subheading">{line.slice(2, -2)}</h5>;
      }
      if (line.startsWith('•')) {
        return <li key={index} className="help-bullet">{line.slice(1).trim()}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="help-paragraph">{line}</p>;
    });
  };

  return (
    <div className="help-center">
      {/* Header */}
      <div className="help-header">
        <div className="help-header-content">
          <div className="help-title-section">
            <h1>📚 Help & Documentation Center</h1>
            <p>Comprehensive guide to mastering your Academic Planner</p>
          </div>
          <button className="help-close-btn" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="help-search-section">
          <div className="help-search-bar">
            <i className="ri-search-line"></i>
            <input
              type="text"
              placeholder="Search help topics, features, or troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="help-body">
        {/* Sidebar Navigation */}
        <div className="help-sidebar">
          <div className="help-nav">
            <h3>Help Topics</h3>
            {sections.map(section => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={section.icon}></i>
                <span>{section.title}</span>
                {searchQuery && filteredContent[section.id] && (
                  <span className="search-result-count">
                    {filteredContent[section.id].items.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="help-quick-actions">
            <h4>Quick Actions</h4>
            <button className="quick-action-btn">
              <i className="ri-download-line"></i>
              Export Data
            </button>
            <button className="quick-action-btn">
              <i className="ri-upload-line"></i>
              Import Data
            </button>
            <button className="quick-action-btn">
              <i className="ri-settings-line"></i>
              Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="help-content-area">
          {searchQuery ? (
            <div className="search-results">
              <h2>Search Results for "{searchQuery}"</h2>
              {Object.keys(filteredContent).length === 0 ? (
                <div className="no-results">
                  <i className="ri-search-line"></i>
                  <p>No results found for your search.</p>
                  <p>Try different keywords or browse the topics in the sidebar.</p>
                </div>
              ) : (
                Object.entries(filteredContent).map(([key, section]) => (
                  <div key={key} className="search-section">
                    <h3>{section.title}</h3>
                    {section.items.map((item, index) => (
                      <div key={index} className="help-item">
                        <h4>{item.question}</h4>
                        <div className="help-answer">
                          {formatAnswer(item.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="help-section-content">
              <h2>{helpContent[activeSection]?.title}</h2>
              <div className="help-items">
                {helpContent[activeSection]?.items.map((item, index) => (
                  <div key={index} className={`help-item ${item.type || ''}`}>
                    <h3>{item.question}</h3>
                    <div className="help-answer">
                      {formatAnswer(item.answer)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="help-footer">
        <div className="help-footer-content">
          <div className="support-section">
            <h4>Still Need Help?</h4>
            <div className="support-options">
              <a href="mailto:support@academicplanner.app" className="support-link">
                <i className="ri-mail-line"></i>
                Email Support
              </a>
              <button className="support-link">
                <i className="ri-chat-3-line"></i>
                Live Chat
              </button>
              <button className="support-link">
                <i className="ri-book-line"></i>
                User Guide
              </button>
            </div>
          </div>
          <div className="version-section">
            <p><strong>Academic Planner v2.0</strong></p>
            <p>Last updated: December 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
