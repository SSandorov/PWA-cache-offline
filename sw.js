// El app shell son aquellos archivos que nuestra página web necesita si o si para
// funcionar. Como el propio nombre indica, es el cascarón de nuestro programa
// El app shell se añade a la memoria en el momento de la instalación
self.addEventListener('install', e => {
    const cacheShell = caches.open('cache-shell')
        .then( cache => {
            return cache.addAll([
                '/index2.html',
                '/css/style.css',
                '/img/main-jpg',
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