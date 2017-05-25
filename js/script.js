// TODO aqui hace falta un refactor porque chiquito desorden... mirar node.js y responsabilidad única de funciones!

'use strict';

let //log = console.log.bind(console), // ELIMINADA POR PROBLEMA CON CHILLI...
    id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    ul = id('ul'),                            // Lo que está bajo los botones de start/stop
    agreeBtn = id('agreeBtn'),                // Botón de Aceptar
    recordBtn = id('recordBtn'),
// start = id('start'),                       // Botón de Start
// stop = id('stop'),                         // Botón de Stop
    stream,                                   // Variables para MediaRecorder, supongo...
    recorder,
    counter=1,
    chunks,
    media,
    locationTime,
    signalEnergy = 0; // Variables mías para localización, timestamp y energía de la señal (PENDIENTE)

window.onload = function() {
    getLocationTime(); // TODO Meter también en saveAndSend() para nombrar archivo generado...
};

agreeBtn.onclick = e => {
    let mediaOptions = {
        audio: {                           // Ajustes de sonido
            tag: 'audio',
            type: 'audio/ogg',
            ext: '.ogg',
            gUM: {audio: true}
        }
    };
    media = mediaOptions.audio;
    navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
        stream = _stream;                          // Preparando la grabación 1
        id('gUMArea').style.display = 'none';
        id('preRecordArea').style.display = 'inherit';
        recorder = new MediaRecorder(stream);      // Preparando la grabación 2
        recorder.ondataavailable = e => {          // Preparando la grabación 3
            chunks.push(e.data);                   // Preparando la grabación 4
            if(recorder.state == 'inactive')  saveAndSend(); // guarda y envía (pendiente)
        };
        log('got media successfully');
    }).catch(log);
}

recordBtn.onclick = e => {
    id('preRecordArea').style.display = 'none';
    //id('preRecordArea').style.display = 'inherit';
    setTimeout(startRecording,1000);
    setInterval(startRecording,180000);
}

function startRecording() {                    // Se ejecuta al pulsar el botón Start
    chunks=[];                                 // Crea un array
    recorder.start();                          // Empieza a grabar (aquí poner timeout)
    setTimeout(stopRecording,5000);
}

function stopRecording() {
    recorder.stop();
}

function saveAndSend(){                         // Crea el link... Esto revisar para ver cómo se hace y enviar a server.

    /*  for (var k = 0; k<chunks.length; k++){  // ESTO ES PARA CALCULAR LA ENERGÍA, PERO COGE EL VECTOR INCORRECTO...
     signalEnergy += (chunks[k]*chunks[k]);
     console.log(signalEnergy);
     } */


    let blob = new Blob(chunks, {type: media.type })
        , url = URL.createObjectURL(blob)
        , li = document.createElement('li')
        , mt = document.createElement(media.tag)
        , hf = document.createElement('a')
    ;

    /* // Mirado en: http://stackoverflow.com/questions/13333378/how-can-javascript-upload-a-blob

     var fd = new FormData();
     fd.append('fname', 'test.wav');
     fd.append('data', soundBlob); // mirar fd.append(name, value, filename);
     $.ajax({
     type: 'POST',
     url: '/upload.php', // el script del backend para procesar el fichero subido!! Aquí hay clave...
     data: fd,
     processData: false,
     contentType: false
     }).done(function(data) {
     console.log(data);
     });

     */

    mt.controls = true;
    mt.src = url;
    hf.href = url;
    hf.download = `${counter++}${media.ext}`;
    hf.innerHTML = `download ${hf.download}`; // + ` Energy: ${signalEnergy}`; para el bucle de antes...
    li.appendChild(mt);
    li.appendChild(hf);
    //li.appendChild(signalEnergy);
    ul.appendChild(li);
}

//FUNCIONES PARA UBICACIÓN
function getLocationTime() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPositionTime);
    } else {
        locationTime = "Geolocation is not supported by this browser";
    }
}

function showPositionTime(position) {
    locationTime = "Lat" + position.coords.latitude +
        "Lon" + position.coords.longitude +
        "Time" + new Date(); // Esto añadiría también el Timestamp al nombre TODO MIRAR FORMATO!
}
