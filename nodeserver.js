/**
 * Importing all the modules required for setting up the server, proccessing
 * incoming files and HTTP requests, as well as the user controllers.
 */
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

/**
 * Setting up express static middleware to serve static HTML files and the request parsing options.
 */
app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * SETTING UP SERVER ROUTES.
 */

/**
 * Main route, which serves the static HTML file under our root directory.
 */
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Route for requesting for credentials to be sent.
 * The credentials are sent as a JSON object.
 */
app.get('/creds', function (req, res) {
    var jsonCr = JSON.stringify(creds);
    res.send(jsonCr);
});

/**
 * Route for requesting the node server status. "false" implies the server is full and
 * no new users will be able to connect at that moment.
 */
app.get('/serverstatus', function (req, res) {
    console.log("Petición de estado del servidor recibida");
    if (userController.checkInactiveUser()) {
        res.send("true");
    } else {
        res.send("false");
    }
});

/**
 * Route to notify user disconnections, allowing the node server to mark the
 * user as inactive through the user controller.
 */
app.post('/userlogoff', function (req, res) {
    var checkOneTime = req.body.oneTimePass;
    if (checkOneTime == "false"){
        userController.userInactive(req.body.id);
        res.end('success');
    }
});

/**
 * Route to check if the user has connected correctly. If not connected, the server will mark that user as inactive
 * through the user controllers. If a 30 minutes user correctly connected, this sets up the timeout to check that user
 * as inactive when the connection time expires.
 */
app.post('/userconnected', function (req, res) {
    if (req.body.connected != 1) {
        var checkOneTime = req.body.oneTimePass;
        if (checkOneTime == true) {
            userControllerOneTime.userInactiveOneTime(req.body.id);

        } else {
            userController.userInactive(req.body.id);
        }
        res.end('success');
    } else if (checkOneTime == true) {
        setTimeout(function () {
            userControllerOneTime.userInactiveOnetime(req.body.id);
        }, 1920000);
        res.end('success');
    }
});

/**
 * Upload route to handle the incoming file uploads. This creates an incoming form object,
 * stores all uploads in the ./uploads directory, and renames the file to it's original name
 * when it uploads successfully. Error and success callbacks are implemented too.
 */
app.post('/upload', function (req, res) {

    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });

    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    form.on('end', function () {
        console.log("Upload successful.");
        setCreds();
        res.end('success');
    });

    form.parse(req);
});

/**
 * Upload route to handle the incoming file uploads from an already logged user.
 * This creates an incoming form object, stores all uploads in the ./uploads directory,
 * and renames the file to it's original name when it uploads successfully.
 * Error and success callbacks are implemented too.
 */
app.post('/loggedupload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    form.on('end', function () {
        console.log("Upload successful.");
        res.end('success');
    });
    form.parse(req);
});

/**
 * Upload route to handle the incoming file uploads from a 30 minutes user.
 * This creates an incoming form object, stores all uploads in the ./uploads directory,
 * and renames the file to it's original name when it uploads successfully.
 * Error and success callbacks are implemented too.
 */
app.post('/onetimepassupload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function () { });
    });
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });
    form.on('end', function () {
        console.log("Upload successful.");
        setCredsOneTime();
        res.end('success');
    });
    form.parse(req);
});

/**
 * Retrieves an user from the user controller and stores its credentials in the creds object.
 */
function setCreds() {
    var data = userController.getInactiveUser();
    creds.id = data[0];
    creds.username = data[1];
    creds.password = data[2];
    creds.oneTimePass = data[3];
}

/**
 * Retrieves a 30 minutes user from the user controller and stores its credentials in the creds object.
 */
function setCredsOneTime() {
    var data = userControllerOneTime.getInactiveUserOneTime();
    creds.id = data[0];
    creds.username = data[1];
    creds.password = data[2];
    creds.oneTimePass = data[3];
    console.log("Credenciales establecidas: %j", creds);
}

/**
 * SSL options object
 */
const options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    passphrase: 'pruebassl'
};

/**
 * This creates the node server. The default port for HTTPS is 443.
 */
https.createServer(options, app).listen(3000, function () {
    console.log('HTTPS server listening on port 3000');
});