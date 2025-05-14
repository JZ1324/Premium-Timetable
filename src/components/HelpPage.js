import React from 'react';
import '../styles/components/HelpPage.css';

const HelpPage = ({ onClose }) => {
  return (
    <div className="help-page-overlay">
      <div className="help-page-container">
        <div className="help-page-header">
          <h2>Help & FAQ</h2>
          <button className="help-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="help-content">
          <section className="help-section">
            <h3>Getting Started</h3>
            <div className="help-item">
              <h4>How do I add classes to my timetable?</h4>
              <p>Click on any empty time slot in the timetable to add a new class. You can specify the subject name, location, and other details.</p>
            </div>
            <div className="help-item">
              <h4>Can I customize the appearance?</h4>
              <p>Yes! Click on the gear icon (⚙️) to open the settings panel where you can change themes and other display options.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>Account Management</h3>
            <div className="help-item">
              <h4>How do I change my password?</h4>
              <p>Click on your profile icon in the top right corner and select "Change Password" from the dropdown menu.</p>
            </div>
            <div className="help-item">
              <h4>What happens if I forget my password?</h4>
              <p>On the login screen, click the "Forgot Password" link and follow the instructions to reset your password via email.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>Tasks & Assignments</h3>
            <div className="help-item">
              <h4>How do I track my assignments?</h4>
              <p>Click on the calendar icon (📅) to switch to the Task Tracker view where you can add, edit, and manage your assignments.</p>
            </div>
            <div className="help-item">
              <h4>Can I set due dates and reminders?</h4>
              <p>Yes, when adding a task you can specify due dates. The system will display tasks ordered by their due dates.</p>
            </div>
          </section>
          
          <section className="help-section">
            <h3>Data Management</h3>
            <div className="help-item">
              <h4>Is my data backed up?</h4>
              <p>Yes, all your timetable data is automatically saved to your account in the cloud. You can access it from any device.</p>
            </div>
            <div className="help-item">
              <h4>Can I export my timetable?</h4>
              <p>Currently, we're working on implementing export functionality. This feature will be available in a future update.</p>
            </div>
          </section>
        </div>
        
        <div className="help-footer">
          <p>If you need additional help, please contact support at support@schooltimetable.example.com</p>
          <button className="help-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;