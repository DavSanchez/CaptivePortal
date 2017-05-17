// TODO cuando hayamos terminado esto no va a hacer falta.

'use strict';

let log = console.log.bind(console),
    id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    ul = id('ul'),                            // Lo que está bajo los botones de start/stop
    gUMbtn = id('gUMbtn'),                    // Botón de Request Stream
    start = id('start'),                      // Botón de Start
    stop = id('stop'),                        // Botón de Stop
    stream,                                   // Variables para MediaRecorder, supongo...
    recorder,
    counter=1,
    chunks,
    media;

gUMbtn.onclick = e => {                        // Se ejecuta al pulsar el botón Request Stream
    let mv = id('mediaVideo'),
        mediaOptions = {
            video: {
                tag: 'video',
                type: 'video/webm',
                ext: '.mp4',
                gUM: {video: true, audio: true}
            },
            audio: {                           // Ajustes de sonido
                tag: 'audio',
                type: 'audio/ogg',
                ext: '.ogg',
                gUM: {audio: true}
            }
        };
    media = mv.checked ? mediaOptions.video : mediaOptions.audio;
    navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
        stream = _stream;                      // Preparando la grabación 1
    id('gUMArea').style.display = 'none';
    id('btns').style.display = 'inherit';
    start.removeAttribute('disabled');
    recorder = new MediaRecorder(stream);      // Preparando la grabación 2
    recorder.ondataavailable = e => {          // Preparando la grabación 3
        chunks.push(e.data);                   // Preparando la grabación 4
        if(recorder.state == 'inactive')  makeLink(); // crea Link para descargar (esto sería enviar a server para mí)
    };
    log('got media successfully');
}).catch(log);
}

start.onclick = e => {                         // Se ejecuta al pulsar el botón Start
    start.disabled = true;
    stop.removeAttribute('disabled');
    chunks=[];                                 // Crea un array
    recorder.start();                          // Empieza a grabar (aquí poner timeout)
}


stop.onclick = e => {                          // Se ejecuta al pulsar el botón Stop
    stop.disabled = true;
    recorder.stop();                           // Deja de grabar (condición de acabar el timeout)
    start.removeAttribute('disabled');
}



function makeLink(){                           // Crea el link... Esto revisar para ver cómo se hace y enviar a server.
    let blob = new Blob(chunks, {type: media.type })
        , url = URL.createObjectURL(blob)
        , li = document.createElement('li')
        , mt = document.createElement(media.tag)
        , hf = document.createElement('a')
    ;
    mt.controls = true;
    mt.src = url;
    hf.href = url;
    hf.download = `${counter++}${media.ext}`;
    hf.innerHTML = `download ${hf.download}`;
    li.appendChild(mt);
    li.appendChild(hf);
    ul.appendChild(li);
}
