import React, { useState, useEffect } from 'react';
import '../styles/components/HelpPage.css';

const HelpPage = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'getting-started', title: '🚀 Getting Started' },
    { id: 'planner-features', title: '📚 Academic Planner Features' },
    { id: 'views-organization', title: '📅 Views and Organization' },
    { id: 'productivity-features', title: '⚡ Productivity Features' },
    { id: 'advanced-features', title: '🔧 Advanced Features' },
    { id: 'troubleshooting', title: '🛠️ Troubleshooting' }
  ];

  // Scroll spy effect to highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const contentElement = document.querySelector('.help-content');
      if (!contentElement) return;
      
      const scrollTop = contentElement.scrollTop;
      const offset = 100; // offset for better UX
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const sectionTop = section.offsetTop - contentElement.offsetTop;
          if (sectionTop <= scrollTop + offset) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    const contentElement = document.querySelector('.help-content');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      // Set initial active section
      handleScroll();
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [sections]);

  // Prevent body scroll when help modal is open
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Re-enable body scroll on cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="help-page-fullscreen">
      <div className="help-page-header">
        <div className="help-header-content">
          <h1>Help & Documentation</h1>
          <p className="help-subtitle">Your complete guide to using Academic Planner</p>
        </div>
        <button className="help-close-button" onClick={onClose} title="Close Help">
          <i className="close-icon">✕</i>
        </button>
      </div>

      <div className="help-main-content">
        <div className="help-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h3>Contents</h3>
            </div>
            <nav className="sidebar-nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="help-content">
          <section className="help-section" id="getting-started">
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
        
        <section className="help-section" id="planner-features">
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
        
        <section className="help-section" id="views-organization">
          <h3>📅 Views and Organization</h3>
          <div className="help-item">
            <h4>What's the difference between Week, Month, and Day views?</h4>
            <p><strong>Day View:</strong> Shows detailed hourly schedule with tasks and classes for one day. <strong>Week View:</strong> Displays your full weekly timetable with all classes. <strong>Month View:</strong> Calendar overview showing assignment due dates and important events.</p>
          </div>
          <div className="help-item">
            <h4>How do I organize my subjects and tasks?</h4>
            <p>Use color coding, tags, and categories to organize your content. Each subject can have its own color theme, and tasks can be tagged by type (homework, project, exam prep, etc.). You can filter views by subject, priority, or tag.</p>
          </div>
          <div className="help-item">
            <h4>Can I sync with external calendars?</h4>
            <p>Yes! Go to Settings &gt; Integrations to connect with Google Calendar, Outlook, or other calendar services. This allows you to see all your commitments in one place and avoid scheduling conflicts.</p>
          </div>
        </section>
        
        <section className="help-section" id="productivity-features">
          <h3>⚡ Productivity Features</h3>
          <div className="help-item">
            <h4>How do notifications work?</h4>
            <p>Set up custom notifications for upcoming classes, assignment deadlines, and study reminders. You can choose notification timing (5 minutes, 1 hour, 1 day before) and delivery method (browser, email, or mobile push).</p>
          </div>
          <div className="help-item">
            <h4>What is the Progress Dashboard?</h4>
            <p>The dashboard shows your academic performance metrics including completion rates, study time analytics, upcoming deadlines, and productivity trends. Use these insights to optimize your study habits and stay on track.</p>
          </div>
          <div className="help-item">
            <h4>How do I use templates?</h4>
            <p>Save frequently used task types, study schedules, or assignment structures as templates. This speeds up planning for recurring activities like weekly labs, essay assignments, or exam preparation routines.</p>
          </div>
        </section>
        
        <section className="help-section" id="advanced-features">
          <h3>🔧 Advanced Features</h3>
          <div className="help-item">
            <h4>How does the AI Parser work?</h4>
            <p>Copy and paste your timetable from any text format (email, PDF, webpage) and our AI will automatically extract class information including times, subjects, rooms, and instructors. Review and confirm the parsed data before importing.</p>
          </div>
          <div className="help-item">
            <h4>Can I collaborate with classmates?</h4>
            <p>Share your timetable or specific assignments with study groups. Collaborate on group projects, compare schedules to find study times, and share notes or resources. Use the sharing options in the top menu.</p>
          </div>
          <div className="help-item">
            <h4>How do I backup and export my data?</h4>
            <p>Go to Settings {'>'} Data Management to export your timetable, tasks, and settings. Choose from formats like JSON, CSV, or PDF. Regular automatic backups are saved to your connected cloud account.</p>
          </div>
        </section>
        
        <section className="help-section" id="troubleshooting">
          <h3>🛠️ Troubleshooting</h3>
          <div className="help-item">
            <h4>My timetable isn't saving properly</h4>
            <p>Check your internet connection and browser storage permissions. Clear your browser cache and try again. If using incognito/private mode, note that data may not persist. Contact support if the issue continues.</p>
          </div>
          <div className="help-item">
            <h4>I can't see my classes in the timetable</h4>
            <p>Verify the correct week is selected and check your view settings (Day/Week/Month). Ensure classes are assigned to the right time slots and days. Use the search function to locate specific classes quickly.</p>
          </div>
          <div className="help-item">
            <h4>The app is running slowly</h4>
            <p>Try refreshing the page, clearing browser cache, or closing other browser tabs. Large amounts of data or many active timers can impact performance. Consider archiving old semesters or completed tasks.</p>
          </div>          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;