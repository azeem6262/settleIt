self.addEventListener('push', function(event) {
    const data = event.data.json(); // Assumes the backend sends JSON
    const options = {
        body: data.body,
        icon: '/icon512_rounded.png', // A path to your app's icon
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});