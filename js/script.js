'use strict';

// TODO aqui hace falta un refactor porque chiquito desorden...

let id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    ul = id('ul'),                            // Lo que está bajo los botones de start/stop
    agreeBtn = id('agreeBtn'),                // Botón de Aceptar
    recordBtn = id('recordBtn'),
    //chilliCon = id('chilliCon'),
    stream,                                   // Variables para MediaRecorder
    recorder,
    chunks,
    media,
    serverStatus,
    locationTime;

window.onload = function() {
    prepareSite();
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
    if (serverStatus === true) {
        console.log('El servidor parece estar bien...');
        id('preRecordArea').style.display = 'none';
        setTimeout(startRecording,100);
        setInterval(startRecording,180000); //TODO esto igual no hace falta con el lease-time... y checkServerStatus()??
    } else {
        console.log('Aquí hay movida');// ALGO. TODO
    }
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
    //prepareSite();
    let blob = new Blob(chunks, {type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);
    console.log('Enviando audio al servidor...');

    $.ajax({
        url: '/upload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful! ' + data);
            receiveResponse();
        }
    });
}

// Petición GET para las credenciales
function receiveResponse(){
    console.log('Pidiendo credenciales...');
    $.ajax({
        type: 'GET',
        url: '/creds',
        dataType: 'json',
        success: function(data) {
            console.log('respuesta recibida: ' + data);
            getUserCredentials(data);
        }
    });
}

// Comprobar que el servicio no está completo
function checkServerStatus(){
    console.log('Comprobando estado del servidor...');
    $.ajax({
        type: 'GET',
        url: '/serverstatus',
        dataType: 'text',
        success: function(data){
            console.log('Respuesta recibida: ' + data);
            if (data === "true"){
                console.log('El servidor parece estar bien.')
                serverStatus = true;
            } else {
                console.log('Servidor parece lleno... Hacer algo.');
                serverStatus = false;
            }
        }
    });
}

//FUNCIONES PARA UBICACIÓN
function prepareSite() {
    checkServerStatus();
    if (navigator.geolocation) {
        try {
            navigator.geolocation.watchPosition(showPositionTime);
        }
        catch(err){
            console.log("Error de ubicación: " + err);
            locationTime = 'LocError';
        }
    } else {
        locationTime = 'Geolocation is not supported by this browser';
    }
}

//FUNCIÓN PARA PONER LATITUD, LONGITUD Y HORA EN UN STRING PARA EL NOMBRE DE LOS ARCHIVOS DE SONIDO
function showPositionTime(position) {
    checkServerStatus();
    console.log('Obteniendo ubicación y marca de tiempo...');
    locationTime = 'Lat' + position.coords.latitude +
        'Lon' + position.coords.longitude +
        'Time' + new Date(); // Esto añadiría también el Timestamp al nombre
}

/*//FUNCIÓN PARA CONECTARSE A CHILLI
function connect(username, password){
    console.log('Conectando...');
    if (username == "" || password == "") // ELABORAR
        console.log('Algo va mal... ¿Usuarios completos? User: '+username+'. Pass: '+password+'.');
    chilliController.logon(username, password);
}*/

//Extraer credenciales del JSON recibido y conectar...
function getUserCredentials(data){
    console.log('Conectando con username: ' + data.username + ' y password: ' + data.password);
    connect(data.username, data.password);
}