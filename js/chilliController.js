// The included script ChilliLibrary.js creates a global chilliController object
// then define event handler functions
chilliController.onError  = handleErrors;
chilliController.onUpdate = updateUI ;

// AJUSTES TEMPORALES PARA SSL (HTTPS)
chilliController.ssl = true;
chilliController.port = 3990;

//FUNCIÓN PARA CONECTARSE A CHILLI
function connect(username, password){
    console.log('Conectando...');
    if (username == "" || password == "") // ELABORAR
        console.log('Algo va mal... ¿Usuarios completos? User: '+username+'. Pass: '+password+'.');
    chilliController.logon(username, password);
}

function disconnect(){
    console.log('Disconnecting...');
    chilliController.logoff();
}

// when the reply is ready, this handler function is called
function updateUI( cmd ) {
    console.log('You called the method ' + cmd +
        '\n Your current state is = ' + chilliController.clientState);
}

// If an error occurs, this handler will be called instead
function handleErrors ( code ) {
    console.log( 'The last contact with the Controller failed. Error code = ' + code );
}
//  finally, get current state
chilliController.refresh();
