// 
self.addEventListener('fetch', event => {
    // Escribimos la variable que maneja el .catch(). 

    // Para el primer ejemplo pondremos un texto plano, pero podría ser todo lo que el 
    // SW haya almacenado en el caché del navegador
    // const offlineResp = new Response(`
        // Bienvenido a mi página web

        // Disculpa, pero para usarla, necesitas internet
    // `);
    // Para el segundo ejemplo vamos a crear una respuesta más elaborada sólo con HTML
    // esta respuesta no puede hacer peticiones, por lo que no podemos referenciar
    // el bootstrap, el css, las imágenes u otros archivos
    // Debemos añadir unos headers para que el navegador interprete esta respuesta
    // como un archivo html y no un texto plano
    // const offlineResp = new Response(`
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <meta http-equiv="X-UA-Compatible" content="ie=edge">
    //         <title>Mi PWA</title>
    //     </head>
    //     <body class="container p-3">
    //         
    //         <h1>Offline Mode</h1>
    //         <hr>
    //     
    //         <p>
    //             Las PWAs son el siguiente paso a las páginas y aplicaciones web.
    //         </p>
    //         <p>
    //             Cargan sumamente rápido y no necesitan conexión a internet para trabajar
    //         </p>
    //     
    //     </body>
    //     </html>
    // `, 
    // {
    //     headers: {
    //         'Content-Type':'text/html'
    //     }
    // });

    // Como tercer ejemplo, vamos a separar el HTML en otro documento. Es una buena 
    // práctica tenerlo separado en un documento HTML y no en JS
    const offlineResp = 1;

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

