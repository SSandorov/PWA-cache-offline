/*
Optimizar el caché es muy importante. Para hacerlo organizamos el caché en tres elementos
    - Estática: app shell
    - Dinámica:
    - Inmutable: p.e. la librería de bootstrap, ya que una versión nunca cambia
*/
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

// El app shell son aquellos archivos que nuestra página web necesita si o si para
// funcionar. Como el propio nombre indica, es el cascarón de nuestro programa
// El app shell se añade a la memoria en el momento de la instalación
self.addEventListener('install', e => {
    const cacheShell = caches.open(CACHE_STATIC_NAME)
        .then( cache => {
            return cache.addAll([
                // es importante de añadir esta primera ruta, ya que el usuario puede
                // acceder a la página web a través de la ruta normal o desde el
                // index.html
                '/',
                '/index.html',
                '/css/style.css',
                '/img/main.jpg',
                '/js/app.js',
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ]);
        } )
        // en caso de que uno de los archivos no los encuentre, la instalación dará un error
        // poco informativo, por lo que es importante pillar el error y devolver una respuesta
        // personalizada
        .catch(console.log);
    
    // Como la instalación es muy rápida, debemos emplear el waitUntil() para que se pueda
    // instalar antes de que se active
    e.waitUntil(cacheShell);
});


// Ahora vamos a mostrar las distintas estrategias del caché que podemos emplear dependiendo
// de las necesidades de nuestro proyecto


self.addEventListener('fetch', e => {
    /*
    En primer lugar tenemos la estrategia del cache only

    Es una estrategia en la que todo el contenido de nuestra aplicación la guardamos en memoria
    y nunca volvemos a pedirla del servidor

    El inconveniente es que los archivos nunca se actualizan porque nunca pasan por el
    servidor, siempre se recuperan desde el SW, por lo que la única manera de actualizar
    los archivos es actualizando el SW
    */
    // e.respondWith(
        // el caches lo componen todos los elementos del caché del dominio en el que nos 
        // encontramos
    //     caches.match( e.request )
    // );

    /*
    En segundo lugar tenemos la estrategia del cache with network fallback

    Es una estrategia que primero comprueba si tenemos el archivo guardado en el caché,
    pero si este no lo está, lo busca en internet

    El inconveniente con esta estrategia es que se mezcla el app shell con otras peticiones,
    por lo que el caché puede crecer muhco y hacer que nuestro usuario borre la aplicación

    Este inconveniente se soluciona optimizando el caché
    */
    const estCache2 = caches.match(e.request)
        .then(res => {
            // Como no podemos manejar los 404 con el .catch() debemos comprobar si la 
            // petición se pudo llevar a cabo
            // en caso de que exista, simplemente la devolvemos
            if (res) return res;

            console.log('No existe ', e.request.url);
            // en caso de que no existe el archivo que se está pidiendo
            // debemos hacer una petición para que nos la traiga
            return fetch(e.request)
                // en caso de que sí pueda encontrar la petición, nos la devuelve
                // y la grabamos en el caché para que no se tenga que volver a 
                // descargar
                // Para la optimización del caché, como estos archivos supuestamente
                // no forman parte del app shell, los guardaremos en la memoria dinámica
                .then(res => {
                    caches.open(CACHE_DYNAMIC_NAME)
                        .then(cache => {
                            // añadimos la petición como elemento del caché
                            
                            cache.put(e.request, res);
                        });
                    // debido a algún fallo en la nueva versión de las promesas, como el res
                    // lo repetimos dos veces, algo falla. Pero clonando la respuesta lo
                    // resolvemos
                    return res.clone();
                })
                .catch(console.log);


        });

    e.respondWith(estCache2);
})
