// Para manejar 
self.addEventListener('fetch', event => {
    // Por cada petición fetch, quiero que me devuelva el conenido de la petición
    event.respondWith(fetch(event.request));
});

