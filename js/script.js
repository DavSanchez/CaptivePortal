'use strict';

// TODO aqui hace falta un refactor porque chiquito desorden...
// TODO imports!!!????
//import {getUserCredentials} from 'userController';

let id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    ul = id('ul'),                            // Lo que está bajo los botones de start/stop
    agreeBtn = id('agreeBtn'),                // Botón de Aceptar
    recordBtn = id('recordBtn'),
    stream,                                   // Variables para MediaRecorder
    recorder,
    chunks,
    media,
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
            if(recorder.state == 'inactive')
                saveAndSend(); // guarda y envía
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
    recorder.start();                          // Empieza a grabar
    setTimeout(stopRecording,5000);
}

function stopRecording() {
    recorder.stop();
}

function saveAndSend(){

    /*  for (var k = 0; k<chunks.length; k++){  // ESTO ERA PARA CALCULAR LA ENERGÍA, PERO COGE EL VECTOR INCORRECTO...
     signalEnergy += (chunks[k]*chunks[k]);
     console.log(signalEnergy);
     } */
    //getLocationTime();
    let blob = new Blob(chunks, {type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);

    $.ajax({
        url: '/upload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful! ' + data);
            // var userCredentials = getUserCredentials();
            // console.log(userCredentials);
            // connect(userCredentials[0], userCredentials[1]); //TODO pendiente.
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

//FUNCIÓN PARA PONER LATITUD, LONGITUD Y HORA EN UN STRING PARA EL NOMBRE DE LOS ARCHIVOS DE SONIDO
function showPositionTime(position) {
    locationTime = 'Lat' + position.coords.latitude +
        'Lon' + position.coords.longitude +
        'Time' + new Date(); // Esto añadiría también el Timestamp al nombre
}

//FUNCIÓN PARA CONECTARSE A CHILLI //TODO pendiente... o algo
function connect(username, password){
    if (username == null || password == null) // ELABORAR
        console.log('Algo va mal... ¿Usuarios completos? User: '+username+'. Pass: '+password+'.');
    chilliController.logon(username, password);
}