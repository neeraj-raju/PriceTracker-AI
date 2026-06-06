// Service Worker for PriceTracker AI Web Push Notifications
self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            
            const options = {
                body: data.body,
                icon: '/favicon.svg', // Icon displayed in the notification
                badge: '/favicon.svg', // Mobile status bar badge
                vibrate: [100, 50, 100], // Vibration pattern
                data: {
                    url: data.url
                }
            };
            
            event.waitUntil(
                self.registration.showNotification(data.title, options)
            );
        } catch (e) {
            console.error('Error parsing push subscription data: ', e);
        }
    }
});

// Handle notification click: Open the Amazon product URL in a new browser window
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
