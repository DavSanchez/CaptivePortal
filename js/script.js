'use strict';

let id = val => document.getElementById(val), // Para extraer la ID de los campos HTML
    agreeBtn = id('agreeBtn'),                // Botón de Aceptar
    recordBtn = id('recordBtn'),
    alertsArea = id('alertsArea'),
    stream,                                   // Variables para MediaRecorder
    recorder,
    chunks,
    media,
    serverStatus,
    locationTime;

var userCreds = {
    id: -1,
    username: "prueba",
    password: "pruebaPass",
    connected: 0
};

window.onload = function () {
    prepareSite();
    checkServerStatus();
    setInterval(checkServerStatus(), 500000);
};

// Pruebita...
window.addEventListener('beforeunload', function (event) {
    if (userCreds.id != -1) {
        disconnect(userCreds);
        //liberateUser(userCreds);
        userCreds.id = -1;
        log('Disconnecting...');
    }
});

window.onbeforeunload = function () {
    if (userCreds.id != -1) {
        disconnect(userCreds);
        //liberateUser(userCreds);
        userCreds.id = -1;
        log('Disconnecting...');
    }
}

agreeBtn.onclick = e => {
    let mediaOptions = {
        audio: {                           // Ajustes de sonido
            tag: 'audio',
            type: 'audio/ogg',
            ext: '.ogg',
            gUM: { audio: true }
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
            if (recorder.state == 'inactive') {
                if (userCreds.id != -1) {
                    loggedUserSaveAndSend(); // guarda y envía
                } else {
                    saveAndSend(); // guarda y envía
                }
            }
        };
        log('got media successfully');
    }).catch(log);
};

recordBtn.onclick = e => {
    if (serverStatus === true) {
        console.log('El servidor parece estar bien...');
        id('preRecordArea').style.display = 'none';
        id('agreedArea').style.display = 'inherit';
        setTimeout(startRecording, 100);
        setInterval(startRecording, 180000);
    } else {
        console.log('Ha ocurrido un error en el servidor. ¿Podría estar completo?');
    }
};

function startRecording() {                    // Se ejecuta al pulsar el botón Start
    chunks = [];                                 // Crea un array
    recorder.start();                          // Empieza a grabar
    setTimeout(stopRecording, 5000);
}

function stopRecording() {
    recorder.stop();
}

function saveAndSend() {
    let blob = new Blob(chunks, { type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${new Date()}${media.ext}`);
    console.log('Enviando audio al servidor...');

    $.ajax({
        url: '/upload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('upload successful! ' + data);
            receiveResponse();
            setAlert("success");
        },
        error: function (data) {
            console.log('upload error ' + data);
            setAlert("error");
        }
    });
}

function loggedUserSaveAndSend() {
    let blob = new Blob(chunks, { type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${new Date()}${media.ext}`);
    console.log('Enviando audio al servidor...');

    $.ajax({
        url: '/loggedupload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('upload successful! ' + data);
            //receiveResponse();
            setAlert("success");
        },
        error: function (data) {
            console.log('upload error ' + data);
            setAlert("errorLogged");
        }
    });
}

function setAlert(info) {
    var newDiv = document.createElement("div");
    if (info === "success") {
        newDiv.className = "alert alert-success";
        newDiv.role = "alert";
        newDiv.innerHTML = "<strong>¡Genia!</strong> Tu fragmento de audio se ha subido con éxito.";
    } else if (info === "error") {
        newDiv.className = "alert alert-danger";
        newDiv.role = "alert";
        newDiv.innerHTML = "<strong>¡Vaya!</strong> Ha habido un error enviando el fichero... Aún no tienes internet. <strong>Trata de conectarte de nuevo.</strong>";
    } else if (info === "errorLogged") {
        newDiv.className = "alert alert-danger";
        newDiv.role = "alert";
        newDiv.innerHTML = "<strong>¡Vaya!</strong> Ha habido un error enviando el fichero... Volveremos a intentarlo más tarde.";
    }
    alertsArea.appendChild(newDiv);
}

// Petición GET para las credenciales
function receiveResponse() {
    console.log('Pidiendo credenciales...');
    $.ajax({
        type: 'GET',
        url: '/creds',
        dataType: 'json',
        success: function (data) {
            console.log('respuesta recibida: ' + data);
            userCreds = data;
            getUserCredentials(userCreds);
        }
    });
}

// Comprobar que el servicio no está completo
function checkServerStatus() {
    console.log('Comprobando estado del servidor...');
    $.ajax({
        type: 'GET',
        url: '/serverstatus',
        dataType: 'text',
        success: function (data) {
            console.log('Respuesta recibida: ' + data);
            if (data === "true") {
                console.log('El servidor parece estar bien.');
                serverStatus = true;
            } else {
                console.log('Servidor parece lleno...');
                serverStatus = false;
                agreeBtn.disabled = true;
                agreeBtn.textContent = "Servidor lleno";
            }
        }
    });
}

// Función para liberar usuario de la lista
function liberateUser(creds) {
    console.log('Liberando usuario...');
    $.ajax({
        type: 'POST',
        url: '/userlogoff',
        data: creds,
        success: function (data) {
            console.log('success ' + data);
        }
    });
}

//FUNCIONES PARA UBICACIÓN
function prepareSite() {
    if (navigator.geolocation) {
        console.log('Intentando obtener ubicación...');
        try {
            navigator.geolocation.watchPosition(showPositionTime, positionError, geoOptions);
        }
        catch (err) {
            console.log("Error de ubicación: " + err);
            locationTime = 'LocError';
        }
    } else {
        console.log('Geolocation not supported');
        locationTime = 'Geolocation is not supported by this browser';
    }
}

//FUNCIÓN PARA PONER LATITUD, LONGITUD Y HORA EN UN STRING PARA EL NOMBRE DE LOS ARCHIVOS DE SONIDO
function showPositionTime(position) {
    console.log('Obteniendo ubicación y marca de tiempo...');
    locationTime = 'Lat' + position.coords.latitude +
        'Lon' + position.coords.longitude +
        'Time' + new Date(); // Esto añadiría también el Timestamp al nombre
}

var geoOptions = {
    enableHighAccuracy: true
};

function positionError(positionError) {
    console.log('Error ' + positionError.code + ' en la geolocalización: ' + positionError.message);
}

//Extraer credenciales del JSON recibido y conectar...
function getUserCredentials(data) {
    console.log('Conectando con username: ' + data.username + ' y password: ' + data.password);
    userCreds.connected = connect(data.username, data.password);

    $.ajax({
        type: 'POST',
        url: '/userconnected',
        data: userCreds,
        success: function (data) {
            console.log('success ' + data);
        }
    });
}