self.addEventListener('push', function(event) {
    var options = {
        body: event.data ? event.data.text() : 'Default Notification',
        // You can customize more notification options here
    };

    event.waitUntil(
        self.registration.showNotification('Notification Title', options)
    );
});
