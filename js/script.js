// TODO aqui hace falta un refactor porque chiquito desorden...

'use strict';

let //log = console.log.bind(console), // ELIMINADA POR PROBLEMA CON CHILLI...
    id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    ul = id('ul'),                            // Lo que está bajo los botones de start/stop
    agreeBtn = id('agreeBtn'),                // Botón de Aceptar
    recordBtn = id('recordBtn'),
    //uploadArea = id('uploadArea'),
    //start = id('start'),                       // Botón de Start
    //stop = id('stop'),                         // Botón de Stop
    stream,                                   // Variables para MediaRecorder
    recorder,
    chunks,
    media,
    //signalEnergy = 0, // Localización, timestamp y energía de la señal (PENDIENTE)
    //counter=1,
    locationTime;

window.onload = function() {
    getLocationTime();
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
};

recordBtn.onclick = e => {
    id('preRecordArea').style.display = 'none';
    setTimeout(startRecording,100);
    setInterval(startRecording,180000);
};

function startRecording() {                    // Se ejecuta al pulsar el botón Start
    chunks=[];                                 // Crea un array
    recorder.start();                          // Empieza a grabar (aquí poner timeout)
    setTimeout(stopRecording,5000);
}

function stopRecording() {
    recorder.stop();
}

function saveAndSend(){

    /*  for (var k = 0; k<chunks.length; k++){  // ESTO ES PARA CALCULAR LA ENERGÍA, PERO COGE EL VECTOR INCORRECTO...
     signalEnergy += (chunks[k]*chunks[k]);
     console.log(signalEnergy);
     } */
    //getLocationTime();
    let blob = new Blob(chunks, {type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);
    //fd.append(`${locationTime}${media.ext}`, blob);

    $.ajax({
        url: '/upload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful! ' + data);
            // Llamada de nuevo al server con AJAX??
            // TODO con el string recibido (data) iniciar sesión en CoovaChilli...
        }
    });
}

//FUNCIONES PARA UBICACIÓN
function getLocationTime() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPositionTime);
    } else {
        locationTime = 'Geolocation is not supported by this browser';
    }
}

function showPositionTime(position) {
    locationTime = 'Lat' + position.coords.latitude +
        'Lon' + position.coords.longitude +
        'Time' + new Date(); // Esto añadiría también el Timestamp al nombre
}