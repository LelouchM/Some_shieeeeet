self.addEventListener('push', (e) => {
	let payload = e.data ? e.data.text() : 'no payload';
	e.waitUntil(
		self.registration.showNotification('Lun baka!', { body: payload })
  	);
});