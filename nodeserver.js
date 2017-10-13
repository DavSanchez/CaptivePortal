/*
 * https://coligo.io/building-ajax-file-uploader-with-node/
 * Let's start off by requiring all the modules needed for the file uploader:
 * express handles our routing and serves up the index.html page and static files to our visitors
 * formidable will parse the incoming form data (the uploaded files)
 * The fs module will be used to rename uploaded files
 * */
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var userController = require('./users/userController');
var userControllerOneTime = require('./users/userControllerOneTime');
var bodyParser = require('body-parser');
var creds = {
    id: -1,
    username: "prueba",
    password: "pruebaPass",
    oneTimePass: false,
    connected: 0
};

/*
 * We'll use the express.static middleware to serve up the static files in our public/ directory
 * and we'll create a route which will serve up the homepage (index.html) when someone visits the website:
 * */
//app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    console.log("Petición al servidor recibida.");
    res.sendFile(path.join(__dirname, 'index.html'));
});

/*
 * Aquí se recibe la petición de credenciales y se envía de vuelta.
 * */
app.get('/creds', function (req, res) {
    console.log("Petición de credenciales recibida. Enviando...");
    var jsonCr = JSON.stringify(creds);
    console.log("Datos enviados: %j", jsonCr);
    res.send(jsonCr);
});
/*
 * Aquí se recibe la petición de estado del servidor, por si los usuarios ya están todos cogidos.
 * */
app.get('/serverstatus', function (req, res) {
    console.log("Petición de estado del servidor recibida");
    if (userController.checkInactiveUser()) {
        res.send("true");
        console.log("El servidor parece estar bien.");
    } else {
        res.send("false");
        console.log("El servidor parece estar lleno");
    }
});

/*
 * Disconnecting user... 
 * */
app.post('/userlogoff', function (req, res) {
    console.log("Datos recibidos UserLogoff: %j", req.body);
    if (req.body.oneTimePass === false) {
        console.log('Recibida desconexión de usuario. Desconectando al usuario ' + req.body.id);
        userController.userInactive(req.body.id);
        res.end('success');
    }
});

/*
* Checking if user connected correctly
* */
app.post('/userconnected', function (req, res) {
    console.log("Datos recibidos: %j", req.body);
    if (req.body.connected != 1) { // Antes era (!req.body.state)
        console.log("El usuario no ha logrado conectarse.");
        if (req.body.oneTimePass == true) {
            console.log("Liberando usuario de 30 minutos " + req.body.id + "...");
            userControllerOneTime.userInactiveOneTime(req.body.id);

        } else {
            console.log("Liberando usuario normal... " + req.body.id + "...");
            userController.userInactive(req.body.id);
        }
        res.end('success');
    } else if (req.body.oneTimePass == true) {
        console.log("CUENTA ATRÁS DEL USUARIO " + req.body.id + " ACTIVADA.");
        setTimeout(function () {
            console.log('Marcando como libre en la base de datos al usuario  ' + req.body.id + ' con tiempo ya agotado...');
            userControllerOneTime.userInactiveOnetime(req.body.id);
        }, 1920000); //Cuenta atrás de 30 minutos hasta que se libere al usuario.
        res.end('success');
    }
});

/*
 * Create the upload/ route to handle the incoming uploads via the POST method:
 * */
app.post('/upload', function (req, res) {
    console.log("Petición para subir audio recibida");
    // create an incoming form object
    var form = new formidable.IncomingForm();
    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');
    // every time a file has been uploaded successfully,
    // rename it to it's original name
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });
    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        console.log("Audio subido con éxito.");
        setCreds();
        res.end('success');
    });
    // parse the incoming request containing the form data
    form.parse(req);
});

app.post('/loggedupload', function (req, res) {
    console.log("Petición para subir audio recibida de un usuario ya conectado");
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    form.on('end', function () {
        console.log("Audio subido con éxito.");
        res.end('success');
    });
    form.parse(req);
});

app.post('/onetimepassupload', function (req, res) {
    console.log("Petición para subir audio recibida de un usuario que pide 30 minutos sin más.");
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    form.on('end', function () {
        console.log("Audio subido con éxito.");
        setCredsOneTime();
        res.end('success');
    });
    form.parse(req);
});

function setCreds() {
    console.log('Estableciendo credenciales...');
    var data = userController.getInactiveUser();
    creds.id = data[0];
    creds.username = data[1];
    creds.password = data[2];
    creds.oneTimePass = data[3];
    console.log("Credenciales establecidas: %j", creds);
}

function setCredsOneTime() {
    console.log('Estableciendo credenciales para usuario con tiempo de 30 minutos...');
    var data = userControllerOneTime.getInactiveUserOneTime();
    creds.id = data[0];
    creds.username = data[1];
    creds.password = data[2];
    creds.oneTimePass = data[3];
    console.log("Credenciales establecidas: %j", creds);
}

const options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    passphrase: 'pruebassl'
};

https.createServer(options, app).listen(3000, function () { // DEFAULT PORT 443
    console.log('HTTPS server listening on port 3000');
});
