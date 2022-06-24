// 
self.addEventListener('fetch', event => {
    // Escribimos la variable que maneja el .catch(). Para este ejemplo pondremos un texto
    // plano, pero podría ser todo lo que el SW haya almacenado en el caché del navegador
    const offlineResp = new Response(`
        Bienvenido a mi página web

        Disculpa, pero para usarla, necesitas internet
    `);

    // Por cada petición fetch, quiero que el sw me devuelva el conenido de la petición
    const resp = fetch(event.request)
    /*
    Cuando el usuario no tenga conexión a internet las peticiones HTTP no podrán ser 
    recogidas. Es por ello que debemos emplear el .catch() de la petición para manejar
    qué hacer cuando no haya conexión a internet
    */
        .catch(() => {
            // Como no hay conexión a internet, debemos regresar las peticiones almacenadas
            // en el caché del navegador
            return offlineResp;
        });

    /*
    Como el retorno del .catch() es una instancia de la clase Response(), el 
    respondWith() nos devolverá el valor del .catch()
    */
    event.respondWith(resp);
});

