// Notification service for the timetable app
// Handles browser notifications for upcoming classes

/**
 * Check if browser notifications are supported
 * @returns {boolean} True if browser supports notifications
 */
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Check if notification permission has been granted
 * @returns {boolean} True if permission is granted
 */
export const hasNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return false;
  }
  return Notification.permission === 'granted';
};

/**
 * Request permission to show notifications
 * @returns {Promise<boolean>} Promise resolving to true if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission previously denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Display a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification|null} Notification object or null if failed
 */
export const showNotification = (title, options = {}) => {
  if (!hasNotificationPermission()) {
    console.log('No permission to show notifications');
    return null;
  }

  try {
    const notification = new Notification(title, options);
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Check upcoming classes against current time and show notifications if needed
 * @param {Array} timeSlots - Array of time slot objects
 * @param {number} notificationMinutes - Minutes before class to show notification
 * @param {number} currentDay - Current school day (1-10)
 * @returns {Object|null} Object containing triggered notification info or null if no notification sent
 */
export const checkUpcomingClasses = (timeSlots, notificationMinutes, currentDay) => {
  if (!hasNotificationPermission() || !timeSlots || !notificationMinutes) {
    return null;
  }

  // Get current time
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutesNow = hours * 60 + minutes;

  // Filter slots for current day
  const todaySlots = timeSlots.filter(slot => slot.day === currentDay);

  // Skip if no classes today
  if (!todaySlots.length) {
    return null;
  }

  // Sort by start time
  todaySlots.sort((a, b) => {
    const aTime = parseTimeString(a.startTime);
    const bTime = parseTimeString(b.startTime);
    return aTime - bTime;
  });

  // Track notifications sent
  const notificationsSent = [];

  // Check for upcoming classes
  for (const slot of todaySlots) {
    // Skip break periods
    if (slot.subject === 'Recess' || slot.subject === 'Lunch') {
      continue;
    }
    
    const slotStartMinutes = parseTimeString(slot.startTime);
    
    // Skip if the class has already started
    if (slotStartMinutes <= totalMinutesNow) {
      continue;
    }
    
    // Calculate time until class starts (in minutes)
    const minutesUntilClass = slotStartMinutes - totalMinutesNow;
    
    // Check if we should show a notification based on user's preference
    if (minutesUntilClass <= notificationMinutes && minutesUntilClass > notificationMinutes - 1) {
      // Format the subject name for display
      let subjectName = slot.subject;
      if (subjectName && subjectName.trim().toUpperCase() === 'PST') {
        subjectName = 'Private Study';
      }
      
      // This class is starting soon and within the notification window
      const title = `Class starting in ${notificationMinutes} minutes`;
      const body = `${subjectName}${slot.room ? ' in ' + slot.room : ''}`;
      const options = {
        body: body,
        icon: '/logo192.png', // Use app icon if available
        badge: '/logo192.png',
        tag: `class-${slot.id || slot.day}-${slot.period}-${now.getTime()}`,
        data: slot
      };
      
      // Show the notification
      const notification = showNotification(title, options);
      
      if (notification) {
        // Set up click handler
        notification.onclick = () => {
          // Focus the window when notification is clicked
          window.focus();
          notification.close();
        };
        
        notificationsSent.push({
          notification,
          slot,
          minutesUntilClass
        });
      }
    }
  }
  
  return notificationsSent.length > 0 ? notificationsSent : null;
};

/**
 * Parse time string (like "8:35am" or "2:25pm") into minutes since midnight
 * @param {string} timeString - Time string to parse
 * @returns {number} Minutes since midnight
 */
export const parseTimeString = (timeString) => {
  if (!timeString) return 0;
  
  // Convert to lowercase and standardize format
  timeString = timeString.toLowerCase().trim();
  
  // Extract hours, minutes, and period (am/pm)
  const match = timeString.match(/(\d+):(\d+)([ap]m)/);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  
  // Convert to 24-hour format
  if (period === 'pm' && hours < 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};
