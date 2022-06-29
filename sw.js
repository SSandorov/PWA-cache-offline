/*
Optimizar el caché es muy importante. Para hacerlo organizamos el caché en tres elementos
    - Estática: app shell
    - Dinámica: peticiones que cambian con el tiempo
    - Inmutable: p.e. la librería de bootstrap, ya que una versión nunca cambia
El caché dinámico se elimina periódicamente para que no se guarden demasiadas cosas en 
memoria
*/
const CACHE_STATIC_NAME = 'static-v3';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

// Variable que almacena el límite de elementos en el caché
const CACHE_DYNAMIC_LIMIT = 50;

// Vamos a configurar el caché dinámico, para que no crezca demasiado
const limpiarCache = (cacheNombre, nElementos) => {
    // encuentra el caché
    caches.open(cacheNombre)
        // selecciona el cache
        .then(cache => {
        // nos devuelve los elementos del cache
            return cache.keys()
                .then(keys => {
                    // si hay más elementos de los que permito elimínalos
                    if ( keys.length >= nElementos ) {
                        cache.delete(keys[0])
                            /*
                            Para poder reiterar en el caché, volvemos a llamar la
                            función para que aplique los mismos criterios
                            */
                            .then(limpiarCache(cacheNombre, nElementos));
                    }
                });
        });
}

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
                '/img/no-img.jpg',
                '/js/app.js'
            ]);
        } )
        // en caso de que uno de los archivos no los encuentre, la instalación dará un error
        // poco informativo, por lo que es importante pillar el error y devolver una respuesta
        // personalizada
        .catch(console.log);

    // Añadimos el caché inmutable con la librería de bootstrap
    const cacheInm = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ]);
        })
        .catch(console.log);
    
    // Como la instalación es muy rápida, debemos emplear el waitUntil() para que se pueda
    // instalar antes de que se active
    e.waitUntil(Promise.all([cacheShell, cacheInm]));
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
    /* 
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


                            // añadimos la función para limpiar el cache
                            limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
                        });
                    // debido a algún fallo en la nueva versión de las promesas, como el res
                    // lo repetimos dos veces, algo falla. Pero clonando la respuesta lo
                    // resolvemos
                    return res.clone();
                })
                .catch(console.log);


        });

    e.respondWith(estCache2); 
    */
    /*
    En tercer lugar tenemos la estrategia network with caché fallback

    En esta estrategia primero hacemos la petición a internet, sino se puede o no se
    encuentra el archivo, lo buscamos en el caché

    Los inconvenientes son que siempre va a hacer la petición a internet, por lo que 
    cada vez que el usuario abra la app con conexión a internet en el dispositivo,
    consumirá megas. Al mismo tiempo vuelve la página web más lenta que en la segunda
    estrategia
    */
    /* 
    const estCache3 = fetch(e.request)

        .then(res => {

            // en caso de que la petición no pueda encontrarse al ser un 404
            // eso es el caso en el que está mal escrita la ruta
            // tal cual como está escrito, no soluciona mucho, pero si 
            // añadiésemos una imagen o un texto estándar quedaría mejor
            if(!res) return caches.match(e.request);

            console.log('Fetch', res);
            // almacenamos la respuesta en memoria
            caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                    cache.put(e.request, res);
                    // mantenemos el caché dinámico limitado
                    limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
                });
            // devolvemos un clon de la respuesta, ya que ne primer lugar la almacenamos
            // en memoria
            return res.clone();
        })
            // manejamos la posibilidad de que no haya conexión a interet, para que 
            // no nos de error
            .catch(err => {
                return caches.match(e.request);
            });

    e.respondWith(estCache3); 
    */
    /*
    En cuarto lugar tenemos la estrategia cache with network update

    Esta estrategia está diseñada para emplearla cuando el rendimiento es fundamental
    
    Es importante entender que las actualizaciones de nuestra página primero se 
    guardarán en la memoria, y no se reflejarán en la aplicación hasta que el usuario
    entre por segunda vez, por lo que siempre verán la versión anterior
    */

    // con esta estrategia sólo devolvemos el cache estático, por lo que podemos
    // manejar las otras peticiones con un condicional
    /* 
    if ( e.request.url.includes('bootstrap') ) {
        // si la petición incluye 'bootstrap' devuelve la petición del cache en el
        // que se encuentre
        return e.respondWith( caches.match(e.request) );
    }

    // busca y abre el caché estático
    const estCache4 = caches.open(CACHE_STATIC_NAME)
            // abrimos el caché estático
            .then(cache => {
                // En caso de que la petición no se encuentre en memoria, o esté
                // una nueva versión, la añadimos en la memoria
                fetch(e.request)
                    .then(res => {
                        cache.put(e.request, res);
                    })
                // y retornamos el elemento que coincide con la petición
                return cache.match(e.request);

                // la versión retornada será la versión antigua, la siguiente vez
                // que el usuario abra la aplicación verá la nueva versión
            });

    e.respondWith(estCache4); 
    */

    /* 
    En quinto lugar tenemos la estrategia cache & network race

    Como el propio nombre indica, es una carrera en para ver cual de los dos devuelve
    la infomación más rápido
    */
    const estCache5 = new Promise((resolve, reject) => {

        let rechazada = false;
        const falloUnaVez = () => {
            if (rechazada) {
                // si entra aquí es que no existe ni en el caché ni en internet
                // evaluamos si es una imagen y sin importar la capitalización
                // con una expresión regular

                if (/\.(png|jpg)$/i.test(e.request.url)) {
                    resolve(caches.match('/img/no-img.jpg'));
                } else {
                    reject('No se encontró respuesta');
                }
            // Podríamos añadir más condiciones dependiendo del tipo de archivo
            } else {
                rechazada = true;
            }
        }
        // petición a internet
        fetch(e.request)
            .then(res => {
                res.ok ? resolve(res) : falloUnaVez();
            })
            // el .catch nos maneja la situación del 404 y la desconexión de internet
            .catch(falloUnaVez);
        // recuperar la petición del caché
        caches.match(e.request)
            .then(res => {
                res ? resolve(res) : falloUnaVez();
            })
            .catch(falloUnaVez);

    });

    e.respondWith(estCache5);
})
