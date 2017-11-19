'use strict';
/**
 * Declaring variables and a function to get the HTML elements.
 * Variables "stream", "recorder", "chunks" y "media" are of use
 * to the MediaStream Recording API. The objecto creds is also
 * declared to store the credentials given by the node server.
 */
let id = val => document.getElementById(val),
    agreeBtn = id('agreeBtn'),
    recordBtn = id('recordBtn'),
    recordBtn30min = id('recordBtn30min'),
    alertsArea = id('alertsArea'),
    stream,
    recorder,
    chunks,
    media,
    serverStatus,
    locationTime;

var userCreds = {
    id: -1,
    username: "prueba",
    password: "pruebaPass",
    oneTimePass: false,
    connected: 0
};

/**
 * This function is executed whenever a user arrives to the captive portal.
 * It loads the geolocation service and checks the server status on fixed time intervals.
 */
window.onload = () => {
    prepareSite();
    checkServerStatus();
    setInterval(checkServerStatus(), 500000);
};

/**
 * 
 * This function is called when the browser tab containing the captive portal closes and the page unloads.
 * If the user was connected to the service and had not asked for a 30 minute connection time, it is logged out.
 */
window.onbeforeunload = e => {
    if (userCreds.id >= 0 && userCreds.oneTimePass == false) {
        disconnect(userCreds);
        userCreds.id = -1;
    }
    var dialogText = "Disconnecting...";
    e.returnValue = dialogText;
    return dialogText;
};

/**
 * This function is called when the Agree button is clicked.
 * It setups and prepares WebRTC to record audio (if the user gives permissions
 * or the device is compatible), changes the user interface buttons (making visible
 * the record area) and waits until recorded data is available, sending the data to
 * the node server depending on the user type.
 */
agreeBtn.onclick = e => {
    let mediaOptions = {
        audio: {
            tag: 'audio',
            type: 'audio/ogg',
            ext: '.ogg',
            gUM: { audio: true }
        }
    };

    media = mediaOptions.audio;
    navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
        stream = _stream;
        id('gUMArea').style.display = 'none';
        id('preRecordArea').style.display = 'inherit';
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => {
            chunks.push(e.data);
            if (recorder.state == 'inactive') {
                if (userCreds.id >= 0) {
                    loggedUserSaveAndSend();
                } else if (userCreds.oneTimePass === false) {
                    saveAndSend();
                } else {
                    saveAndSendOneTimePass();
                }
            }
        };
        log('got media successfully');
    }).catch(function(err){
        agreeBtn.disabled = true;
        agreeBtn.textContent = "Permiso denegado o incompatible";
    });
};

/**
 * This function is called when the "Conectar" button is clicked.
 * It starts the recording and changes the user interface to notify it.
 * It also sets up the time intervals to repeat the recording.
 */
recordBtn.onclick = e => {
    if (serverStatus === true) {
        userCreds.oneTimePass = false;
        id('preRecordArea').style.display = 'none';
        id('agreedArea').style.display = 'inherit';
        setTimeout(startRecording, 100);
        setInterval(startRecording, 180000);
    } else {
        console.log('Error');
    }
};

/**
 * This function is called when the "Quiero solo 30 minutos" button is clicked.
 * It starts the recording and changes the user interface to notify it.
 */
recordBtn30min.onclick = e => {
    if (serverStatus === true) {
        userCreds.oneTimePass = true;
        id('preRecordArea').style.display = 'none';
        id('agreedArea').style.display = 'inherit';
        setTimeout(startRecording, 100);
    } else {
        console.log('Error');
    }
};

/**
 * This function starts the recording. It prepares the data vector to receive the blob and
 * sets the timer to stop the current recording.
 */
function startRecording() {
    chunks = [];
    recorder.start();
    setTimeout(stopRecording, 5000);
}

/**
 * This function stops the current recording.
 */
function stopRecording() {
    recorder.stop();
}


/**
 * This function checks the node server, if no users are available for connection
 * the Agree button of the user interface deactivates and changes their text.
 */
function checkServerStatus() {
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

/**
 * This function renames the audio data recorded and sends it to the node server
 * for normal users, alerting the user of the upload success or failure.
 */
function saveAndSend() {
    let blob = new Blob(chunks, { type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);

    $.ajax({
        url: '/upload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('[Normal] upload successful! ' + data);
            receiveResponse();
            setAlert("success");
        },
        error: function (data) {
            console.log('[Normal] upload error ' + data);
            setAlert("error");
        }
    });
}

/**
 * This function renames the audio data recorded and sends it to the node server
 * for logged users, alerting the user of the upload success or failure.
 */
function loggedUserSaveAndSend() {
    let blob = new Blob(chunks, { type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);

    $.ajax({
        url: '/loggedupload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('[Logged] upload successful! ' + data);
            setAlert("success");
        },
        error: function (data) {
            console.log('[Logged] upload error ' + data);
            setAlert("errorLogged");
        }
    });
}

/**
 * This function renames the audio data recorded and sends it to the node server
 * for 30 minutes users, alerting the user of the upload success or failure.
 */
function saveAndSendOneTimePass() {
    let blob = new Blob(chunks, { type: media.type });
    var fd = new FormData();
    fd.append('blob', blob, `${locationTime}${media.ext}`);

    $.ajax({
        url: '/onetimepassupload',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('[One-time] upload successful! ' + data);
            receiveResponse();
            setAlert("successOneTime");
        },
        error: function (data) {
            console.log('[One-time] upload error ' + data);
            setAlert("error");
        }
    });
}

/**
 * This function receives the server response, stores the credentials sent
 * on the local userCreds object and calls the function to connect with the
 * credentials received.
 */
function receiveResponse() {
    $.ajax({
        type: 'GET',
        url: '/creds',
        dataType: 'json',
        success: function (data) {
            userCreds = data;
            connectUser(userCreds);
        }
    });
}

/**
 * This function connects the user with the credentials retrieved from the server.
 * It attempts the connection, waits some time for the Chilli controller to solve
 * the connection attempt and checks its result, alerting the user of the outcome. 
 * @param data The user credentials received from the node server
 */
function connectUser(data) {
    console.log('Conectando con username: ' + data.username + ' y password: ' + data.password);
    connect(data.username, data.password);

    setTimeout(2500, function () {
        if (chilliController.clientState === 1) {
            console.log("Estado de conexión a CoovaChilli: " + chilliController.clientState);
            userCreds.connected = chilliController.clientState;
            $.ajax({
                type: 'POST',
                url: '/userconnected',
                data: userCreds,
                success: function (data) {
                    console.log('success ' + data);
                }
            });
        } else if (chilliController.clientState === 2) {
            console.log("Estado de conexión a CoovaChilli: " + chilliController.clientState);
            setAlert("error");
        }
    });
}

/**
 * This function asks the node server to liberate the current user credentials,
 * freeing them for other users of the service.
 * @param creds The user credentials to be liberated on the node server
 */
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

/**
 * This function sets up the browser to get the geolocation info from the user
 * (after prompting the user for permissions). It checks the geolocation each time
 * the user position changes using the watchPosition() function.
 */
function prepareSite() {
    if (navigator.geolocation) {
        try {
            navigator.geolocation.watchPosition(showPositionTime, positionError, geoOptions);
        }
        catch (err) {
            locationTime = 'LocError';
        }
    } else {
        locationTime = 'Geolocation is not supported by this browser';
    }
}

/**
 * This is the callback function for when the watchPosition() function is successful,
 * storing the positioning info and the current timestamp on a variable to use in the
 * uploaded audio file's name.
 * @param position The user coordinates.
 */
function showPositionTime(position) {
    console.log('Obteniendo ubicación y marca de tiempo...');
    locationTime = 'Lat' + position.coords.latitude +
        'Lon' + position.coords.longitude +
        'Time' + new Date();
}

/**
 * Option for high accuracy in geolocation.
 */
var geoOptions = {
    enableHighAccuracy: true
};

/**
 * This is the callback function called when the watchPosition() function fails (check prepareSite()), 
 * printing the error code in the user's console.
 * @param positionError The error object returned by the watchPosition() function if it fails.
 */
function positionError(positionError) {
    console.log('Error ' + positionError.code + ' in geolocation: ' + positionError.message);
}

/**
 * This function alerts the user of the success or failure of the audio file uploads and other errors.
 * It creates a new HTML element and adds a label to it, colored according to the Bootstrap color schemes.
 * @param info The alert type.
 */
function setAlert(info) {
    var newDiv = document.createElement("div");
    switch (info) {
        case "success":
            newDiv.className = "alert alert-success";
            newDiv.role = "alert";
            newDiv.innerHTML = "<strong>¡Perfecto!</strong> Tu fragmento de audio se ha subido con éxito.";
            break;
        case "error":
            newDiv.className = "alert alert-danger";
            newDiv.role = "alert";
            newDiv.innerHTML = "<strong>¡Vaya!</strong> Ha habido un error... Aún no tienes internet. <strong>Trata de conectarte de nuevo.</strong>";
            break;
        case "errorLogged":
            newDiv.className = "alert alert-danger";
            newDiv.role = "alert";
            newDiv.innerHTML = "<strong>¡Vaya!</strong> Ha habido un error enviando el fichero... Volveremos a intentarlo más tarde.";
            break;
        case "successOneTime":
            newDiv.className = "alert alert-success";
            newDiv.role = "alert";
            newDiv.innerHTML = "<strong>¡Perfecto!</strong> Tu fragmento de audio se ha subido con éxito. <strong>Ya puedes cerrar esta pestaña en tu navegador y disfrutar de tus 30 minutos de internet.</strong>";
            break;
    }
    alertsArea.appendChild(newDiv);
}