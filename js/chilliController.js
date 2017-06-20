//FUNCIÓN PARA CONECTARSE A CHILLI
export function connect(username, password){
    console.log('Conectando...');
    if (username == "" || password == "") // ELABORAR
        console.log('Algo va mal... ¿Usuarios completos? User: '+username+'. Pass: '+password+'.');
    chilliController.logon(username, password);
}

// The included script creates a global chilliController object

// If you use non standard configuration, define your configuration
//chilliController.host = "10.0.0.1";  // Default is 192.168.182.1 // MIRAR IP DE LA UNI Y PUERTOS!!!
//chilliController.port  = 4003     ;  //  Default is 3990
//chilliController.interval = 60    ;  // Default is 30 seconds

// then define event handler functions
chilliController.onError  = handleErrors;
chilliController.onUpdate = updateUI ;

// when the reply is ready, this handler function is called
function updateUI( cmd ) {
    alert ('You called the method ' + cmd +
        '\n Your current state is = ' + chilliController.clientState);
}

// If an error occurs, this handler will be called instead
function handleErrors ( code ) {
    alert ( 'The last contact with the Controller failed. Error code = ' + code );
}
//  finally, get current state
chilliController.refresh();