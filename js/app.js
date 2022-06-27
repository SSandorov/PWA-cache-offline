

if ( navigator.serviceWorker ) {
    navigator.serviceWorker.register('/sw.js');
}

/*
El cache storage forma parte del objeto window, a diferencia del SW que forma parte del
navegador

Como no todos los navegadores lo soportan, tenemos que hacer una comprobación en primer
lugar
*/
if( window.caches ) {
    // El open() busca y crea archivos del caché. Si no encuentra el elemento del argumento
    // lo crea, y si lo encuentra lo devuelve
    caches.open('prueba-1')
        .then(console.log);

    caches.open('prueba-2')
        .then(console.log);

    // El has() nos comprueba si un archivo existe en el caché
    // Nos devuelve una promesa, por lo que podemos emplear el .then() y el .catch()
    caches.has('prueba-2')
        .then(console.log);

    // El delete() sirve para borrar el caché manualmente. Es importante borrarlo para
    // que el caché no tenga archivos innecesarios, así el usuario no tiene una razón
    // para borrar la página web
    caches.delete('prueba-1')
        .then(console.log);
    
    caches.delete('prueba-2');


    // El uso práctico es el siguiente
    // Creamos un elemento el el caché
    caches.open('caches-v1.1')
    // añadimos los archivos que queremos tener guardados en la memoria
        .then( cache => {
            // de esta manera agregamos un elemento
            // cache.add('/index.html');
            // de esta manera agregamos varios elementos
            cache.addAll([
                '/index.html',
                '/css/style.css',
                '/js/app.js',
                '/img/main.jpg'
            ])
            // Para poder borrar algún elemento del caché debemos añadirlo después
            // de que se hayan creado, sino el proceso de eliminación sucederá antes,
            // por lo que no se borrará ningún archivo
                // .then(() => {
                //     cache.delete(argumento);
                // });

            // Si lo que necesito es reemplazar un archivo por otro, hacemos lo siguiente
                // .then(() => {
                //     cache.put('/index.html', new Response(nuevo-doc));
                // })
            // con este código, cada vez que haya un nuevo archivo, lo podemos reemplazar
            // por el viego, y así mantenemos la página actualizada
            ;
            // Si lo que quiero es mostrar uno de los elementos en consola
            // cache.match('/index.html')
            //     .then(res => {
            //         res.text()
            //             .then(console.log);
            //     })

        } );
    
    // Si lo que busco es saber todos los elementos que hay en el caché
    caches.keys()
        .then(console.log);
    // nos devuelve un arreglo con todos los elementos del caché
}