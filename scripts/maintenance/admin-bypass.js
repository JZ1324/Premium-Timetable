// Simple admin check bypass
// Add this to your browser console to force admin status

// Method 1: Directly set admin in localStorage
localStorage.setItem('isAdmin', 'true');

// Method 2: Override the isAdmin function
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
  console.log('Development mode: Enabling admin access');
  
  // Find React component and force admin state
  const timetableComponent = document.querySelector('[data-admin-check]');
  if (timetableComponent) {
    // Force admin button to show
    const adminButton = document.createElement('button');
    adminButton.textContent = 'Admin';
    adminButton.className = 'admin-button';
    adminButton.onclick = () => {
      // Trigger admin terminal
      window.dispatchEvent(new CustomEvent('showAdminTerminal'));
    };
    
    const buttonsContainer = document.querySelector('.timetable-controls');
    if (buttonsContainer) {
      buttonsContainer.appendChild(adminButton);
    }
  }
}

console.log('Admin bypass script loaded. Reload the page if needed.');
