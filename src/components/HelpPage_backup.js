import React from 'react';
import '../styles/components/HelpPage.css';

const HelpPage = ({ onClose }) => {
  return (
    <div class        <div className="help-footer">
          <div className="help-footer-content">
            <div className="support-info">
              <h4>Need More Help?</h4>
              <p>📧 Email: support@academicplanner.app</p>
              <p>📖 Documentation: Check our comprehensive guides in the docs section</p>
              <p>💡 Tips: Hover over any feature icon for quick help tooltips</p>
            </div>
            <div className="version-info">
              <p><strong>Version:</strong> Premium Academic Planner v2.0</p>
              <p><strong>Last Updated:</strong> Features and improvements added regularly</p>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose}>Close</button>
        </div>
    </div>ullscreen">
      <div className="help-page-header">
        <div className="help-header-content">
          <h1>Help & Documentation</h1>
          <p className="help-subtitle">Your complete guide to using Academic Planner</p>
        </div>
        <button className="help-close-button" onClick={onClose} title="Close Help">
          <i className="close-icon">✕</i>
        </button>
      </div>
        
        <div className="help-content">
          <section className="help-section">
            <h3>🚀 Getting Started</h3>
            <div className="help-item">
              <h4>How do I create my timetable?</h4>
              <p>Start by clicking on any empty time slot in the timetable grid to add a new class. Fill in the subject name, room, teacher, and other details. You can also use the "Import" feature to quickly add your entire timetable from text or use our AI parser for automatic conversion.</p>
            </div>
            <div className="help-item">
              <h4>How do I switch between timetable and planner views?</h4>
              <p>Use the navigation tabs at the top of the screen. The "Timetable" view shows your class schedule, while the "Academic Planner" view helps you manage tasks, assignments, and study sessions.</p>
            </div>
            <div className="help-item">
              <h4>Can I customize the appearance?</h4>
              <p>Yes! Click the settings icon (⚙️) to access theme options, display settings, and personalization features. Choose from multiple themes including dark mode, light mode, and colorful themes.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>📚 Academic Planner Features</h3>
            <div className="help-item">
              <h4>How do I add tasks and assignments?</h4>
              <p>In the Academic Planner, click "New Task" or "New Assignment" to create items. Set priority levels, due dates, estimated time, and progress tracking. You can also break down large assignments into smaller subtasks.</p>
            </div>
            <div className="help-item">
              <h4>How does the study timer work?</h4>
              <p>Click the timer button (⏱️) on any task to start a focused study session. The timer tracks your progress automatically and updates the task's completion percentage. You can pause or stop the timer at any time.</p>
            </div>
            <div className="help-item">
              <h4>What are AI Study Suggestions?</h4>
              <p>Our AI analyzes your study patterns and provides personalized suggestions like when to take breaks, which subjects to focus on, and how to manage upcoming deadlines. These appear in the Day View to help optimize your study schedule.</p>
            </div>
            <div className="help-item">
              <h4>How do I use Focus Mode?</h4>
              <p>Click the focus icon on any task to enter distraction-free Focus Mode. This provides a clean interface with timer, task details, and study tips to help you concentrate on one task at a time.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>🗓️ Views and Organization</h3>
            <div className="help-item">
              <h4>What are the different view modes?</h4>
              <p><strong>Day View:</strong> Shows today's tasks with priority grouping and AI suggestions.<br/>
              <strong>Week View:</strong> Displays tasks across the week in a calendar format.<br/>
              <strong>Month View:</strong> Monthly overview perfect for long-term planning.<br/>
              <strong>Year View:</strong> Annual perspective for major deadlines and milestones.</p>
            </div>
            <div className="help-item">
              <h4>How do I filter and search tasks?</h4>
              <p>Use the sidebar filters to show/hide completed tasks, filter by subject, priority, or type. The search bar supports text search, and you can access Advanced Search for complex queries by date ranges, keywords, and combinations.</p>
            </div>
            <div className="help-item">
              <h4>Can I organize tasks by priority?</h4>
              <p>Yes! Set tasks as High, Medium, or Low priority. Tasks are automatically grouped and color-coded: High (red), Medium (yellow), Low (blue). Overdue tasks are highlighted prominently.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>⚡ Productivity Features</h3>
            <div className="help-item">
              <h4>How do I track my study progress?</h4>
              <p>Each task has a progress bar that you can manually adjust or let the timer update automatically. View detailed analytics in the Analytics Dashboard to see time spent per subject, completion rates, and study patterns.</p>
            </div>
            <div className="help-item">
              <h4>What are task templates?</h4>
              <p>Templates are pre-configured task formats for common activities like "Essay Writing," "Math Problem Set," or "Study Session." They save time by auto-filling typical duration estimates and subtasks.</p>
            </div>
            <div className="help-item">
              <h4>How do I set up recurring tasks?</h4>
              <p>When creating or editing a task, enable the "Recurring" option and choose frequency (daily, weekly, monthly). Perfect for regular study sessions, homework reviews, or weekly assignments.</p>
            </div>
            <div className="help-item">
              <h4>Can I share tasks with study partners?</h4>
              <p>Yes! Use the share button (🔗) on any task to copy details to clipboard or share via your device's native sharing features. Great for group projects and study coordination.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>🔧 Advanced Features</h3>
            <div className="help-item">
              <h4>How does the AI timetable parser work?</h4>
              <p>Copy your timetable from any source (Word, PDF, email) and paste it into the Import dialog. Click "Parse with AI" and our system will automatically identify classes, times, and details to create your structured timetable.</p>
            </div>
            <div className="help-item">
              <h4>What keyboard shortcuts are available?</h4>
              <p><strong>N:</strong> New task<br/>
              <strong>A:</strong> New assignment<br/>
              <strong>Escape:</strong> Close modals<br/>
              <strong>1-4:</strong> Switch between Day/Week/Month/Year views<br/>
              These shortcuts work throughout the application for faster navigation.</p>
            </div>
            <div className="help-item">
              <h4>How do I backup and sync my data?</h4>
              <p>All data is automatically saved to your browser's local storage and can be synced to the cloud with an account. Use Export in settings to download your data as backup, and Import to restore from backup files.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>🛠️ Troubleshooting</h3>
            <div className="help-item">
              <h4>My data disappeared - what happened?</h4>
              <p>Data is stored locally in your browser. If you cleared browser data or used incognito mode, data may be lost. Always create an account and export backups regularly. Check if you're logged into the correct account.</p>
            </div>
            <div className="help-item">
              <h4>The timer isn't working properly</h4>
              <p>Ensure your browser allows background processes. If the timer stops when switching tabs, try keeping the planner tab active during study sessions. Refresh the page if timers become unresponsive.</p>
            </div>
            <div className="help-item">
              <h4>Import isn't working with my timetable format</h4>
              <p>Try the AI parser for complex formats. For manual import, ensure your data follows the expected format: Day headers, period times, and class details in rows. Check the import dialog for format examples.</p>
            </div>
            <div className="help-item">
              <h4>Performance is slow with many tasks</h4>
              <p>Archive or delete completed tasks regularly. Use filters to show only relevant tasks. Clear browser cache and ensure you're using an updated browser version for optimal performance.</p>
            </div>
          </section>
        </div>
        
        <div className="help-footer">
          <div className="help-footer-content">
            <div className="support-info">
              <h4>Need More Help?</h4>
              <p>📧 Email: support@academicplanner.app</p>
              <p>📖 Documentation: Check our comprehensive guides in the docs section</p>
              <p>💡 Tips: Hover over any feature icon for quick help tooltips</p>
            </div>
            <div className="version-info">
              <p><strong>Version:</strong> Premium Academic Planner v2.0</p>
              <p><strong>Last Updated:</strong> Features and improvements added regularly</p>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;