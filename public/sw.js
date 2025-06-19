// Service Worker for Enhanced Cross-Platform Notifications
// Enables persistent notifications across phones, laptops, PCs, and MacBooks

const CACHE_NAME = 'timetable-notifications-v2';
const APP_VERSION = '2.1.0';

// Install event - enhanced for better caching
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker installing... v' + APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/mobile.html',
        '/mobile-signin.html',
        '/favicon.ico'
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated v' + APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Enhanced push notification handler
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);
  
  let notificationData = {
    title: 'School Timetable',
    body: 'Class starting soon!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  // Enhanced notification options for cross-platform compatibility
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    vibrate: [100, 50, 100, 50, 100], // Enhanced vibration pattern
    data: {
      ...notificationData.data,
      timestamp: Date.now(),
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: '📚 View Timetable',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: true, // Keep notification visible until user interacts
    silent: false,
    tag: notificationData.tag || 'class-reminder',
    renotify: true, // Allow multiple notifications with same tag
    timestamp: Date.now(),
    // Platform-specific enhancements
    dir: 'auto', // Text direction
    lang: 'en-US' // Language
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag, 'Action:', event.action);
  
  event.notification.close();

  // Handle different actions
  if (event.action === 'view') {
    // Open the timetable app
    event.waitUntil(handleNotificationClick(event.notification.data?.url || '/'));
  } else if (event.action === 'dismiss') {
    // Just close the notification and track dismissal
    console.log('📊 Notification dismissed by user');
    return;
  } else {
    // Default action - open the app
    event.waitUntil(handleNotificationClick(event.notification.data?.url || '/'));
  }
});

// Enhanced function to handle notification clicks across all platforms
async function handleNotificationClick(url = '/') {
  try {
    // Get all window clients
    const clientList = await clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    });
    
    // Check if app is already open
    for (const client of clientList) {
      if (client.url.includes(self.location.origin)) {
        // Focus existing window and navigate if needed
        if ('focus' in client) {
          await client.focus();
          if (client.url !== url && 'navigate' in client) {
            return client.navigate(url);
          }
          return client;
        }
      }
    }
    
    // If no existing window, open a new one
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  } catch (error) {
    console.error('❌ Error handling notification click:', error);
    // Fallback - try to open window anyway
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }
}

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
});

// Background sync for notifications (when app is closed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-classes') {
    event.waitUntil(checkClassesInBackground());
  }
});

// Function to check classes in background
async function checkClassesInBackground() {
  try {
    // Get stored timetable data
    const timetableData = await getStoredTimetableData();
    if (!timetableData) return;

    const { timeSlots, currentDay, notificationMinutes } = timetableData;
    
    // Check for upcoming classes
    const now = new Date();
    const totalMinutesNow = now.getHours() * 60 + now.getMinutes();
    
    const todaySlots = timeSlots.filter(slot => slot.day === currentDay);
    
    for (const slot of todaySlots) {
      if (slot.subject === 'Recess' || slot.subject === 'Lunch' || slot.subject === 'Free Period') {
        continue;
      }
      
      const slotStartMinutes = parseTimeString(slot.startTime);
      const minutesUntilClass = slotStartMinutes - totalMinutesNow;
      
      // Send notification if class is starting soon
      if (minutesUntilClass <= notificationMinutes && minutesUntilClass > 0) {
        await self.registration.showNotification(
          `📚 ${slot.subject} starting in ${Math.ceil(minutesUntilClass)} minutes`,
          {
            body: `${slot.room ? `Room ${slot.room}` : 'Check your timetable'}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
              { action: 'view', title: 'View Timetable' },
              { action: 'dismiss', title: 'Dismiss' }
            ],
            data: slot
          }
        );
      }
    }
  } catch (error) {
    console.error('Background notification check failed:', error);
  }
}

// Helper function to get stored timetable data
async function getStoredTimetableData() {
  try {
    // This would typically come from IndexedDB or local storage
    // For now, we'll use a simple approach
    return null; // Implement based on your storage strategy
  } catch (error) {
    console.error('Failed to get stored timetable data:', error);
    return null;
  }
}

// Helper function to parse time strings
function parseTimeString(timeString) {
  if (!timeString) return 0;
  
  timeString = timeString.toLowerCase().trim();
  const match = timeString.match(/(\d+):(\d+)([ap]m)/);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  
  if (period === 'pm' && hours < 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

// Push event handler (for future server-sent notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Timetable' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

console.log('🔔 Service Worker loaded and ready for notifications');
