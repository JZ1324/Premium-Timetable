// Enhanced Notification service for the timetable app
// Cross-platform notifications for phones, laptops, PCs, and MacBooks

/**
 * Check if browser notifications are supported
 * @returns {boolean} True if browser supports notifications
 */
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Check if we're on a mobile device
 * @returns {boolean} True if on mobile device
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
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
 * Enhanced permission request with better UX and cross-platform support
 * @returns {Promise<boolean>} Promise resolving to true if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported in this browser');
    return false;
  }

  // Check current permission status
  if (Notification.permission === 'granted') {
    await registerServiceWorker();
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission previously denied. Please enable in browser settings.');
    showPermissionInstructions();
    return false;
  }

  try {
    // Show a user-friendly dialog first (optional)
    const userConsent = await showNotificationConsentDialog();
    if (!userConsent) {
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    if (granted) {
      await registerServiceWorker();
      console.log('✅ Notifications enabled successfully!');
    } else {
      console.log('❌ Notification permission denied');
      showPermissionInstructions();
    }
    
    return granted;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Register service worker for enhanced notification support
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Show user-friendly consent dialog before requesting permission
 * @returns {Promise<boolean>} User consent
 */
export const showNotificationConsentDialog = () => {
  return new Promise((resolve) => {
    // Create a modern modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      backdrop-filter: blur(5px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    `;

    dialog.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
        Enable Class Notifications
      </h3>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        Get notified before your classes start on all your devices - phone, laptop, and desktop.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="allow-btn" style="
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">Enable Notifications</button>
        <button id="deny-btn" style="
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">Maybe Later</button>
      </div>
    `;

    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Handle button clicks
    dialog.querySelector('#allow-btn').onclick = () => {
      document.body.removeChild(modal);
      resolve(true);
    };

    dialog.querySelector('#deny-btn').onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    };
  });
};

/**
 * Show instructions for enabling notifications in browser settings
 */
export const showPermissionInstructions = () => {
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isMobile = isMobileDevice();

  let instructions = '';
  
  if (isMobile) {
    if (/iPhone|iPad/.test(navigator.userAgent)) {
      instructions = 'Open Settings > Safari > Advanced > Website Data > Premium Timetable > Notifications > Allow';
    } else {
      instructions = 'Open Chrome Settings > Site Settings > Notifications > Allow for this site';
    }
  } else {
    if (isChrome) {
      instructions = 'Click the 🔒 icon in address bar > Notifications > Allow';
    } else if (isFirefox) {
      instructions = 'Click the shield icon > Permissions > Notifications > Allow';
    } else if (isSafari) {
      instructions = 'Safari > Preferences > Websites > Notifications > Allow';
    } else {
      instructions = 'Check your browser settings to allow notifications for this site';
    }
  }

  console.log('📖 To enable notifications:', instructions);
};

/**
 * Enhanced notification display with cross-platform optimization
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification|null} Notification object or null if failed
 */
export const showNotification = async (title, options = {}) => {
  if (!hasNotificationPermission()) {
    console.log('No permission to show notifications');
    return null;
  }

  try {
    // Enhanced options for better cross-platform support
    const enhancedOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      requireInteraction: true, // Keep notification visible until user interacts
      persistent: true, // For service worker notifications
      timestamp: Date.now(),
      ...options,
      // Enhanced mobile support
      image: options.image,
      actions: [
        {
          action: 'view',
          title: 'View Timetable',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ]
    };

    let notification;

    // Use service worker notifications if available (better for mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, enhancedOptions);
        console.log('✅ Service Worker notification sent');
        return true;
      } catch (swError) {
        console.log('Service Worker notification failed, falling back to regular notification');
      }
    }

    // Fallback to regular browser notification
    notification = new Notification(title, enhancedOptions);

    // Enhanced event handlers
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Navigate to timetable if not already there
      if (!window.location.pathname.includes('timetable')) {
        window.location.href = '/';
      }
    };

    notification.onshow = () => {
      console.log('📢 Notification displayed');
    };

    notification.onerror = (error) => {
      console.error('Notification error:', error);
    };

    // Auto-close after 10 seconds on desktop (mobile handles this differently)
    if (!isMobileDevice()) {
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);
    }

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Enhanced class checking with better notification timing and management
 * @param {Array} timeSlots - Array of time slot objects
 * @param {number} notificationMinutes - Minutes before class to show notification
 * @param {number} currentDay - Current school day (1-10)
 * @returns {Object|null} Object containing triggered notification info or null if no notification sent
 */
export const checkUpcomingClasses = async (timeSlots, notificationMinutes, currentDay) => {
  if (!hasNotificationPermission() || !timeSlots || !notificationMinutes) {
    return null;
  }

  // Get current time with enhanced precision
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const totalMinutesNow = hours * 60 + minutes + (seconds / 60); // Include seconds for precision

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

  // Enhanced notification windows for better user experience
  const notificationWindows = [
    { minutes: notificationMinutes, message: `in ${notificationMinutes} minutes`, priority: 'normal' },
    { minutes: 10, message: 'in 10 minutes', priority: 'normal' },
    { minutes: 5, message: 'in 5 minutes', priority: 'high' },
    { minutes: 2, message: 'in 2 minutes', priority: 'high' },
    { minutes: 1, message: 'in 1 minute', priority: 'urgent' },
    { minutes: 0, message: 'now', priority: 'urgent' }
  ];

  // Track notifications sent
  const notificationsSent = [];
  const currentTimestamp = Date.now();

  for (const slot of todaySlots) {
    // Skip break periods and free periods
    if (slot.subject === 'Recess' || slot.subject === 'Lunch' || slot.subject === 'Free Period') {
      continue;
    }
    
    const slotStartMinutes = parseTimeString(slot.startTime);
    const slotEndMinutes = parseTimeString(slot.endTime);
    
    // Skip if the class has already ended
    if (slotEndMinutes <= totalMinutesNow) {
      continue;
    }
    
    // Calculate time until class starts (in minutes with decimal precision)
    const minutesUntilClass = slotStartMinutes - totalMinutesNow;
    
    // Check each notification window
    for (const window of notificationWindows) {
      // Enhanced time window check with better precision
      const timeWindow = window.minutes === 0 ? 0.5 : 0.75; // Wider window for "now" notifications
      
      if (Math.abs(minutesUntilClass - window.minutes) <= timeWindow) {
        const notificationKey = `${slot.day}-${slot.period}-${window.minutes}`;
        
        // Enhanced cooldown system to prevent spam
        const lastSent = localStorage.getItem(`notification-${notificationKey}`);
        const cooldownDuration = window.minutes === 0 ? 120000 : 300000; // 2min for "now", 5min for others
        
        if (lastSent && (currentTimestamp - parseInt(lastSent)) < cooldownDuration) {
          continue;
        }

        // Enhanced subject name formatting
        let subjectName = slot.subject || 'Unknown Subject';
        if (subjectName.trim().toUpperCase() === 'PST') {
          subjectName = 'Private Study';
        }
        
        // Create enhanced notification content based on platform
        const title = window.minutes === 0 
          ? `📚 ${subjectName} is starting now!`
          : `⏰ ${subjectName} starting ${window.message}`;
          
        const body = `${slot.room ? `📍 Room ${slot.room}` : '📱 Check your timetable'}${slot.teacher ? ` • 👨‍🏫 ${slot.teacher}` : ''}`;
        
        // Enhanced notification options for cross-platform compatibility
        const options = {
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `class-${notificationKey}-${Math.floor(currentTimestamp / 60000)}`, // Update tag every minute
          data: {
            ...slot,
            notificationTime: currentTimestamp,
            priority: window.priority,
            url: window.minutes === 0 ? '/' : '/'
          },
          // Enhanced vibration patterns based on priority
          vibrate: window.priority === 'urgent' 
            ? [200, 100, 200, 100, 200] 
            : window.priority === 'high' 
            ? [100, 50, 100] 
            : [50],
          // Platform-specific enhancements
          requireInteraction: window.priority === 'urgent', // Keep urgent notifications visible
          silent: false,
          timestamp: currentTimestamp,
          dir: 'auto',
          lang: 'en-US',
          // Enhanced actions based on notification type
          actions: window.minutes === 0 
            ? [
                { action: 'view', title: '📚 Open Timetable', icon: '/favicon.ico' },
                { action: 'remind', title: '⏰ Remind in 5min', icon: '/favicon.ico' },
                { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
              ]
            : [
                { action: 'view', title: '📱 View Timetable', icon: '/favicon.ico' },
                { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
              ]
        };
        
        try {
          // Enhanced notification sending with multiple fallbacks
          let notificationSent = false;
          
          // Method 1: Service Worker notifications (best for mobile and background)
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
              const registration = await navigator.serviceWorker.ready;
              await registration.showNotification(title, options);
              notificationSent = true;
              console.log(`🔔 Service Worker notification sent for ${subjectName} (${window.message})`);
            } catch (swError) {
              console.log('Service Worker notification failed, trying browser notification');
            }
          }
          
          // Method 2: Browser Notification API (fallback)
          if (!notificationSent && 'Notification' in window) {
            try {
              const notification = new Notification(title, options);
              
              // Enhanced event handlers for better user experience
              notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
                
                // Navigate based on action or default to timetable
                if (event.target.data?.url) {
                  window.location.href = event.target.data.url;
                } else {
                  window.location.href = '/';
                }
              };
              
              notification.onshow = () => {
                console.log(`📢 Browser notification displayed for ${subjectName}`);
              };
              
              notification.onerror = (error) => {
                console.error('Browser notification error:', error);
              };
              
              // Platform-specific auto-close behavior
              const autoCloseDelay = isMobileDevice() ? 8000 : 12000;
              setTimeout(() => {
                if (notification) {
                  notification.close();
                }
              }, autoCloseDelay);
              
              notificationSent = true;
            } catch (browserError) {
              console.error('Browser notification failed:', browserError);
            }
          }
          
          // Method 3: In-app notification (last resort)
          if (!notificationSent) {
            showInAppNotification(title, body, window.priority);
            notificationSent = true;
            console.log(`📱 In-app notification shown for ${subjectName}`);
          }
          
          if (notificationSent) {
            // Store notification timestamp to prevent duplicates
            localStorage.setItem(`notification-${notificationKey}`, currentTimestamp.toString());
            
            // Track successful notification
            notificationsSent.push({
              subject: subjectName,
              time: window.message,
              period: slot.period,
              room: slot.room,
              priority: window.priority
            });
            
            // Enhanced analytics/logging
            console.log(`✅ Notification sent successfully:`, {
              subject: subjectName,
              timeUntil: window.message,
              priority: window.priority,
              platform: 'serviceWorker' in navigator ? 'ServiceWorker' : 'Browser',
              timestamp: new Date().toISOString()
            });
          }
          
        } catch (error) {
          console.error(`❌ Failed to send notification for ${subjectName}:`, error);
        }
      }
    }
  }

  return notificationsSent.length > 0 ? notificationsSent : null;
};

// Enhanced in-app notification fallback for when browser notifications fail
const showInAppNotification = (title, body, priority = 'normal') => {
  // Create in-app notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${priority === 'urgent' ? '#ef4444' : priority === 'high' ? '#f59e0b' : '#3b82f6'};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    max-width: 350px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
  `;
  
  notification.innerHTML = `
    <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
    <div style="opacity: 0.9;">${body}</div>
    <div style="position: absolute; top: 8px; right: 8px; font-size: 18px; opacity: 0.7;">×</div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after delay
  const removeDelay = priority === 'urgent' ? 10000 : 7000;
  const timeoutId = setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, removeDelay);
  
  // Click to dismiss
  notification.onclick = () => {
    clearTimeout(timeoutId);
    notification.remove();
    window.focus();
  };
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });
};

/**
 * Initialize notification system and set up automatic checking
 * @param {Array} timeSlots - Time slots data
 * @param {number} currentDay - Current day
 * @param {number} notificationMinutes - Minutes before class to notify
 */
export const initializeNotifications = async (timeSlots, currentDay, notificationMinutes = 10) => {
  console.log('🔔 Initializing notification system...');
  
  // Request permission if not already granted
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('❌ Notifications not enabled');
    return false;
  }

  // Set up periodic checking (every 30 seconds)
  setInterval(() => {
    checkUpcomingClasses(timeSlots, notificationMinutes, currentDay);
  }, 30000);

  // Send a test notification to confirm it's working
  await showNotification('🎉 Notifications Enabled!', {
    body: 'You\'ll now receive alerts before your classes start',
    silent: true
  });

  console.log('✅ Notification system initialized successfully');
  return true;
};

/**
 * Test notification function for debugging
 */
export const sendTestNotification = async () => {
  const testTitle = '🧪 Test Notification';
  const testOptions = {
    body: 'This is a test notification to verify the system is working correctly',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  const result = await showNotification(testTitle, testOptions);
  console.log('Test notification result:', result);
  return result;
};

/**
 * Comprehensive notification system initialization for all platforms
 * Works on phones, laptops, PCs, MacBooks, tablets, etc.
 */
export const initializeCrossPlatformNotifications = async () => {
  console.log('🚀 Initializing cross-platform notification system...');
  
  try {
    // Step 1: Check browser support
    if (!('Notification' in window)) {
      console.error('❌ This browser does not support notifications');
      return { success: false, error: 'Browser not supported' };
    }
    
    // Step 2: Register service worker for enhanced mobile support
    let swRegistration = null;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker is ready');
      } catch (swError) {
        console.warn('⚠️ Service Worker registration failed, notifications will still work:', swError);
      }
    }
    
    // Step 3: Request notification permission with enhanced UI
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Use our custom permission request UI for better UX
      const userConsent = await showPermissionRequestModal();
      if (userConsent) {
        permission = await Notification.requestPermission();
      } else {
        console.log('📱 User declined notification permission');
        return { success: false, error: 'Permission denied by user' };
      }
    }
    
    if (permission !== 'granted') {
      console.log('❌ Notification permission not granted:', permission);
      return { success: false, error: `Permission ${permission}` };
    }
    
    // Step 4: Test notification system across all platforms
    console.log('🧪 Testing notification system...');
    
    // Test different notification methods
    const testResults = {
      serviceWorker: false,
      browser: false,
      inApp: false
    };
    
    // Test Service Worker notifications (best for mobile)
    if (swRegistration) {
      try {
        await swRegistration.showNotification('🎉 Cross-Platform Notifications Ready!', {
          body: 'Service Worker notifications are working perfectly',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [100, 50, 100],
          silent: true,
          tag: 'sw-test'
        });
        testResults.serviceWorker = true;
        console.log('✅ Service Worker notifications: WORKING');
      } catch (error) {
        console.warn('⚠️ Service Worker notifications failed:', error);
      }
    }
    
    // Test Browser API notifications (fallback)
    try {
      const browserNotification = new Notification('📱 Browser Notifications Ready!', {
        body: 'Standard browser notifications are working',
        icon: '/favicon.ico',
        silent: true,
        tag: 'browser-test'
      });
      
      // Auto close test notification
      setTimeout(() => browserNotification.close(), 3000);
      testResults.browser = true;
      console.log('✅ Browser notifications: WORKING');
    } catch (error) {
      console.warn('⚠️ Browser notifications failed:', error);
    }
    
    // Test in-app notifications (last resort)
    try {
      showInAppNotification('✨ In-App Notifications Ready!', 'Fallback notifications are available', 'normal');
      testResults.inApp = true;
      console.log('✅ In-app notifications: WORKING');
    } catch (error) {
      console.warn('⚠️ In-app notifications failed:', error);
    }
    
    // Step 5: Set up platform-specific optimizations
    const platform = getPlatformInfo();
    console.log('📱 Platform detected:', platform);
    
    // iOS Safari specific optimizations
    if (platform.isIOS && platform.isSafari) {
      console.log('🍎 Applying iOS Safari optimizations...');
      // iOS Safari has special requirements - notifications only work if app is added to home screen
      if (!window.navigator.standalone) {
        console.log('💡 For best notification experience on iOS, add this app to your home screen');
      }
    }
    
    // Android Chrome specific optimizations
    if (platform.isAndroid && platform.isChrome) {
      console.log('🤖 Applying Android Chrome optimizations...');
      // Enable background sync for offline notifications
      if (swRegistration && 'sync' in swRegistration) {
        try {
          await swRegistration.sync.register('check-classes');
          console.log('✅ Background sync enabled for Android');
        } catch (syncError) {
          console.warn('⚠️ Background sync not available:', syncError);
        }
      }
    }
    
    // Desktop optimizations (Windows, macOS, Linux)
    if (platform.isDesktop) {
      console.log('💻 Applying desktop optimizations...');
      // Desktop can handle more frequent checks and richer notifications
    }
    
    // Step 6: Return comprehensive status
    const successCount = Object.values(testResults).filter(Boolean).length;
    
    return {
      success: successCount > 0,
      platform,
      testResults,
      serviceWorkerSupported: !!swRegistration,
      permission: permission,
      methods: {
        primary: testResults.serviceWorker ? 'serviceWorker' : testResults.browser ? 'browser' : 'inApp',
        fallbacks: Object.keys(testResults).filter(key => testResults[key])
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize notification system:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get detailed platform information for optimization
 */
const getPlatformInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isDesktop: /Win|Mac|Linux/.test(platform) && !/Mobile|Tablet/.test(userAgent),
    isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isEdge: /Edge/.test(userAgent),
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsNotifications: 'Notification' in window,
    supportsPush: 'PushManager' in window,
    supportsVibrate: 'vibrate' in navigator,
    userAgent: userAgent,
    platform: platform
  };
};

/**
 * Smart notification scheduler that adapts to platform capabilities
 */
export const scheduleSmartNotifications = (timeSlots, currentDay, notificationMinutes) => {
  const platform = getPlatformInfo();
  
  // Adjust check frequency based on platform
  const checkInterval = platform.isMobile ? 45000 : 30000; // 45s for mobile, 30s for desktop
  
  console.log(`⏰ Setting up smart notifications (checking every ${checkInterval/1000}s)`);
  
  // Clear any existing intervals
  if (window.notificationInterval) {
    clearInterval(window.notificationInterval);
  }
  
  // Set up adaptive checking
  window.notificationInterval = setInterval(async () => {
    try {
      await checkUpcomingClasses(timeSlots, notificationMinutes, currentDay);
    } catch (error) {
      console.error('Error checking upcoming classes:', error);
    }
  }, checkInterval);
  
  // Also check immediately
  checkUpcomingClasses(timeSlots, notificationMinutes, currentDay);
  
  return window.notificationInterval;
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
